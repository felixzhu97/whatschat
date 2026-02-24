# WhatsChat User Maps

This folder contains three user maps for the WhatsChat messaging platform: user journey, persona, and story map.

## User Journey Map

Shows the journey from first contact to daily use:

- **Discovery** – Learn about the product, visit the site
- **Registration** – Sign up, verify email, complete profile
- **First use** – Log in, explore UI, add contacts
- **Daily use** – Send/receive messages, view status
- **Advanced** – Voice/video calls, groups, file sharing
- **Settings** – Privacy, data management

Each stage includes actions, emotions, pain points, and opportunities.

**File**: [user-journey-map.puml](../../zh/product/user-journey-map/user-journey-map.puml)

## User Persona Map

Defines user roles and characteristics:

- **Regular User** – Everyday chat, ease of use
- **Active User** – Heavy use, needs efficiency
- **Group Admin** – Manages groups, needs permissions
- **Enterprise User** – Team collaboration, security and compliance

**File**: [user-persona-map.puml](../../zh/product/user-journey-map/user-persona-map.puml)

## User Story Map

Organizes features by user activities:

- Auth and account
- Contacts
- Messaging
- Voice/video calls
- Groups
- Status
- Settings and privacy

Each activity has epics, user stories, and acceptance criteria.

**File**: [user-story-map.puml](../../zh/product/user-journey-map/user-story-map.puml)

## When to update

- New features → update story map
- User feedback → update journey map (pain points, opportunities)
- Research → update persona map
- Releases → keep all maps in sync

## Viewing diagrams

1. [PlantUML online](https://www.plantuml.com/plantuml/uml/) – paste `.puml` content  
2. VS Code – [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml), `Alt+D`  
3. CLI: `plantuml docs/zh/product/user-journey-map/*.puml`

## References

- [Journey mapping](https://www.nngroup.com/articles/journey-mapping-101/)
- [Personas](https://www.nngroup.com/articles/persona/)
- [User story mapping](https://www.jpattonassociates.com/user-story-mapping/)

[中文](../../zh/product/user-journey-map/README.md)
