# Tag Instructor App

Show custom messages depending on any tag.

### Authors

App has designed, built and promoted during Zendesk 2018 by:

- Andrey Sarapulov
- Vladimir Avrov
- Kamila Koppe
- Klaus Gotthardt
- Andreas Mahl
- Magdalena Kluwe

### Legal

<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

<div>Icons made by <a href="https://www.flaticon.com/authors/dave-gandy" title="Dave Gandy">Dave Gandy</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

### Technology stack

App has built using the following technology stack and bounded by all legal and technical limitations.

- [Vuejs 2.5.17](https://vuejs.org/)
- [underscore 1.9.1](https://underscorejs.org)
- [es6-promise 4.2.5](https://www.npmjs.com/package/es6-promise)
- [jquery-ajax 2.1.4](https://api.jquery.com/category/ajax/)
- [Zendesk Application Framework v2](https://developer.zendesk.com/apps/docs/developer-guide/getting_started)

### Settings

- `show_popup` - If selected the App will show little popup on top right side of the screen giving Agent a summary of the messages.

- `hide_disclaimer` - If selected the App will hide the little question mark on top right side of the App screen.

- `hide_if_no_messages` - If selected the App will be hidden if there are no messages to show.

- `tags_config` - It expected JSON as per example below

```
{
	  "agent": [
	    {
	      "tags": [
	        "mac",
	        "accord"
	      ],
	      "operator": "any",
	      "message": "<b>Welcome on board Newhire!</b><br>We are glad you here! To get help you can contact your manager or check out our Help Center.",
	      "kind": "notice"
	    }
	  ],
	  "user": [
	    {
	      "tags": [
	        "usertag1",
	        "usertag2"
	      ],
	      "operator": "all",
	      "message": "<b>IMPORTANT</b> This end-user is flagged as being very sensitive to the English languge. Make sure you proof read all your communication.",
	      "kind": "alert"
	    },
	    {
	      "tags": [
	        "usertag3"
	      ],
	      "operator": "any",
	      "message": "This end-user has very long history with us and should be treated carefully",
	      "kind": "notice"
	    }
	  ],
	  "organization": [
	    {
	      "tags": [
	        "orgtag1"
	      ],
	      "operator": "any",
	      "message": "<b>WARNING!</b><br>This organization is a key business partner. All your communication with anyone from this organization should be pre-approved!",
	      "kind": "error"
	    }
	  ],
	  "ticket": [
	    {
	      "tags": [
	        "sla_standard",
	        "priority_changed"
	      ],
	      "operator": "any",
	      "message": "This ticket is on <b>STANDARD SLA</b> at this moment. If you change priority to Urgent it will impact the SLA.",
	      "kind": "notice",
	      "css": "background:black;color:white;"
	    }
	  ],
	  "ticket_requester": [
	    {
	      "tags": [
	        "usertag1"
	      ],
	      "operator": "all",
	      "message": "You are dealing with VIP customer. Please follow these advises:<ul><li>1. Always proof read your comments;</li><li>2. Use dedicated macro if available;</li><li>3. Avoid complex responses.</li></ul>",
	      "kind": "alert"
	    }
	  ],
	  "ticket_assignee": [
	    {
	      "tags": [
	        "eng"
	      ],
	      "operator": "any",
	      "message": "Ticket is assigned to Newhire. Make sure all customer communication has been approved.",
	      "kind": "alert"
	    },
	    {
	      "tags": [
	        "new_ticket"
	      ],
	      "operator": "all",
	      "message": "It is uncommon for Newhires to handle tickets like that. Check with your manager.",
	      "kind": "error"
	    }
	  ],
	  "ticket_organization": [
	    {
	      "tags": [
	        "orgtag2"
	      ],
	      "operator": "any",
	      "message": "This organization has open opportunity with us at this moment. Please treat it carefully!",
	      "kind": "alert"
	    }
	  ],
	  "ticket_collaborators": [
	    {
	      "tags": [
	        "orgtag2"
	      ],
	      "operator": "any",
	      "message": "Person CCed to this ticket is known as <b><CEO/b>. Make sure you are sending relevant communication out.",
	      "kind": "notice"
	    },
	    {
	      "tags": [
	        "test_tag1"
	      ],
	      "operator": "all",
	      "message": "Person CCed to this ticket is one of local managers. None of the managers should be CCed on tickets like that.",
	      "kind": "error"
	    }
	  ]
	  
  }
```

JSON structure must match the below example:

```
{
	"agent":[],
	"user":[],
	"organization":[],
	"ticket":[],
	"ticket_requester":[],
	"ticket_assignee":[],
	"ticket_organization":[],
	"ticket_collaborators":[]
}
```

Every array elemnt should be an object as described below: 

```
{
      "tags": [
        "test_tag1"
      ],
      
      "operator": "all", // "any", "all"
      
      "message": "Here goes text or HTML message when conditions are met!",
      
      "kind": "notice", // notice (green), alert (yellow), error(red)
      
      "css": "background:orange;color:white;" // optional. If supplied will overwrite the standard styling from the "kind" key
}
```

### The following information is displayed:

App scans tags from the following places:

- "agent"
- "user"
- "organization"
- "ticket"
- "ticket_requester"
- "ticket_assignee"
- "ticket_organization"
- "ticket_collaborators"

And displayed pre-deifed HTML messages.

### Screenshots:

![](https://cl.ly/dce914f3c0a4/Image%202018-10-01%20at%204.49.53%20PM.png)

![](https://cl.ly/103f2a2cb8a3/Image%202018-10-01%20at%204.50.18%20PM.png)

![](https://cl.ly/a0dee440ba68/Image%202018-10-01%20at%204.50.42%20PM.png)

![](https://cl.ly/a234039a50e2/Image%202018-10-01%20at%205.48.22%20PM.png)
