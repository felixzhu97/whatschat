# WhatsChat Wardley Map

This folder contains the Wardley Map for the WhatsChat messaging platform.

## What is a Wardley Map

A Wardley Map shows where system components sit on:

- **Value chain (Y-axis)** – From user needs down to infrastructure
- **Evolution (X-axis)** – From genesis (novel) to commodity

## File

- [wardley-map.puml](../../zh/product/wardley-map/wardley-map.puml) – Full Wardley Map (PlantUML)

## Uses

- **Technology decisions** – Build vs buy
- **Architecture evolution** – How components move toward commodity
- **Cost** – What can be commoditized
- **Strategy** – Differentiating vs generic capabilities

## Map structure

### Value chain (Y)

1. **User needs** – Messaging, voice/video, file sharing  
2. **Applications** – Web app, mobile app  
3. **Platform** – Messaging, auth, calls, files, search, push  
4. **Infrastructure** – DB, cache, storage, search, WebSocket, WebRTC, CDN, containers  

### Evolution (X)

- **Genesis** – AI assistant, smart search, advanced WebRTC  
- **Custom built** – Messaging service, call service, file service  
- **Product** – Web/mobile apps, auth, push, search  
- **Commodity** – DB, cache, storage, CDN, containers  

## Viewing

1. [PlantUML online](https://www.plantuml.com/plantuml/uml/) – paste `wardley-map.puml` content  
2. VS Code – [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml), `Alt+D`  
3. CLI: `plantuml docs/zh/product/wardley-map/wardley-map.puml`

## References

- [Wardley Maps](https://wardleymaps.com/)
- [Learn Wardley Mapping](https://learnwardleymapping.com/)

[中文](../../../zh/product/wardley-map/README.md)
