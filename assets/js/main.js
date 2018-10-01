(function(client) {
    'use strict';

    client.on('app.registered',init);

    function init(e) {
      getTranslation().then(function(i18n) {
        createVM({
          i18n: i18n,
          context: e.context,
          metadata: e.metadata,
          location: e.context.location,
          isModal: e.context.location === "modal",
          isNavBar: e.context.location === "nav_bar",
          isTicket: e.context.location.indexOf('ticket') > -1,
          locationConfig: {
            "new_ticket_sidebar":{
                "path":"ticket",
                "events":["ticket.tags.changed","ticket.requester.id.changed","ticket.assignee.user.id.changed","ticket.organization.changed","ticket.collaborators.changed"]
              },
              "ticket_sidebar":{
                "path":"ticket",
                "events":["ticket.updated","ticket.tags.changed","ticket.requester.id.changed","ticket.assignee.user.id.changed","ticket.organization.changed","ticket.collaborators.changed"]
              },
              "user_sidebar":{
                "path":"user",
                "events":["user.tags.changed"]
              },
              "organization_sidebar":{
                "path":"organization",
                "events":["organization.tags.changed"]
              },
              "nav_bar":{
                "events":["currentUser.tags.changed"]
              }
          },
          tags: {
            "agent":[],
            "user":[],
            "organization":[],
            "ticket":[],
            "ticket_requester":[],
            "ticket_assignee":[],
            "ticket_organization":[],
            "ticket_collaborators":[]
          },
          defaut_tag_config: {
            "operator":"any",
            "kind":"notice"
          },
          messagesCount: {
              "notice": 0,
              "alert": 0,
              "error": 0
          },
          currentUser: "",
          currentPath: "",
          currentTagsConfig: {},
          currentMessages: {},
          hasMessages: true,
          wasPopUpShown: false
        })
      }).catch(function(err) {
        console.log("Critical error!", err);
      })
    }

    function getTranslation(){
      return client.get('currentUser').then(function(agent) {
        return agent['currentUser'].locale.replace(/-.+$/,'');
      }).then(function(locale) {
        return new ES6Promise(function getTranslationFile(resolve, reject) {
          $.ajax('i18n/'+locale+'.json').done(function(json) {
            resolve(json);
          }).fail(function(e) {
            if (locale === 'en') reject('Default locale file is missing, broken or can not be loaded.'); else {
              locale = 'en';
              getTranslationFile(resolve,reject);
            }
          });
        });
      });
    };

    function createVM(data) {
      var vm = new Vue({
        el: '#app',
        data: data,
        mounted: function(){
          if (this.isModal) {
            this.handleModal();
          } else {
              this.currentTagsConfig = this.getTagsConfig();
              this.getData().then(function() {
              client.invoke('show');
              this.$el.style.display = 'block';
              this.resize();
            }.bind(this)).then(function() {
              this.attachListeners();
            }.bind(this));
          }
        },
        watch: {
          tags: {
            handler: _.debounce(function() {
              this.checkTags();
            }, 300),
            deep: true
          },
          currentMessages: _.debounce(function() {
              this.actionMessages();
              this.resize();
          }, 300)
        },
        filters: {
          pretifyJson: function (json) {
            return JSON.stringify(json, null, '\t');
          }
        },
        methods: {
          resize: _.debounce(function(newHeight,newWidth) {
            var h = (newHeight || this.$el.scrollHeight) + 10 + 'px';
            return (this.location !== "nav_bar") && client.invoke('resize', { width: (newWidth || '100%'), height:h });
          },100),
          getData: function() {
            return client.get(_.compact(['currentUser', this.getLocationConfig("path")])).then(function(data) {   
              this.currentPath = this.getLocationConfig("path");
              this.currentUser = data['currentUser'];
              _.once(this.showNavBar());
              this.getTags(data[this.currentPath]);
            }.bind(this));
          },
          showNavBar: function() {
            if (this.currentUser.role === "admin") {
              client.get('instances').then(function(instances) {
                var navBarClient = _.findWhere(instances.instances, { "location": "nav_bar" }).instanceGuid;
                client.instance(navBarClient).invoke('show');                  
              })
             }
          },
          getTags: function(currentContext){
            this.tags.agent = this.currentUser.tags;
            if (this.currentPath) {
              this.tags[this.currentPath] = currentContext.tags;
              if (this.isTicket) {
                this.tags.ticket_requester = currentContext.requester ? currentContext.requester.tags : [];
                this.tags.ticket_assignee = currentContext.assignee && currentContext.assignee.user ? currentContext.assignee.user.tags : [];
                this.tags.ticket_organization = currentContext.organization ? currentContext.organization.tags : [];
                this.tags.ticket_collaborators = currentContext.collaborators && _.chain(currentContext.collaborators).map(function(cc) {
                  return cc.tags;
                }).union().flatten().uniq().value();
              }
            }
          },
          checkTags: function() {
            this.currentMessages = _.mapObject(this.currentTagsConfig, function(obj, key) {
              return _.filter(obj, function(tag_config) {
                return this.isConditionMatch(tag_config, key);
              }.bind(this));
            }.bind(this));
          },
          isConditionMatch: function(tag_config, key) {
            tag_config = _.extend(this.defaut_tag_config, tag_config);
            var overlap = _.intersection(this.tags[key],tag_config.tags);
            return (tag_config.operator === "all") ? overlap.length === tag_config.tags.length : overlap.length > 0;
          },
          getTagsConfig: function(){
            try {
              return JSON.parse(this.metadata.settings.tags_config) || {};
            } catch(err) {
              this.showError(this.i18n.error.unable_to_parse_json,err,true);
            }
          },
          actionMessages: function() {
            this.hasMessages = !_.chain(this.currentMessages).values().flatten().isEmpty().value();
            if (this.metadata.settings.show_popup && this.hasMessages && !this.isNavBar && !this.wasPopUpShown) {
              _.chain(this.currentMessages).values().flatten().each(function(msg, index) {
                if (!_.isUndefined(this.messagesCount[msg.kind])) this.messagesCount[msg.kind] = this.messagesCount[msg.kind] + 1;
              }.bind(this)).value();
              var fullMessage = this.i18n.notification.message_1 + '<br><br>' +
                                this.getMsg('notice') +
                                this.getMsg('alert') +
                                this.getMsg('error') + '<br>' +
                                this.i18n.notification.message_2 + ' ' +
                                this.metadata.name + ' ' +
                                this.i18n.notification.app +  ' ' +
                                this.i18n.notification.message_3;
              
              client.invoke('notify', fullMessage, 'alert', 8000);
              client.invoke('appsTray.show');
              this.wasPopUpShown = true;
            }
            if (this.metadata.settings.hide_if_no_messages && !this.hasMessages) client.invoke('hide');
          },
          getMsg: function(msgType) {
            return this.messagesCount[msgType] ? this.messagesCount[msgType] + ' ' + this.i18n.notification[msgType] + '<br>' : '';
          },
          showError: function(msg, data, isPopup) {              
            console.log('[' + new Date().toUTCString() + '] ' + ( this.metadata.name || 'AppTM' ) + ': ' + msg, data);
            if (isPopup) client.invoke('notify', msg, 'error', 8000);
          },
          getLocationConfig: function(attr) {
            return this.locationConfig[this.location] ? this.locationConfig[this.location][attr] : undefined;
          },
          attachListeners: function() {
            _.each(this.getLocationConfig('events'), function(event) {
              client.on(event, this.getData);
            }.bind(this));
          },
          showDeflectionModal: function(){
            client.invoke('instances.create', {
              location: 'modal',
              url: 'assets/iframe.html'
            });
          },
          handleModal: function() {
           this.$el.innerHTML = this.i18n.deflection_message;
           client.invoke('show');
           this.$el.style.display = 'block';
           this.resize("100%","40vw");
          }
        }
      });
    }
})(ZAFClient.init());