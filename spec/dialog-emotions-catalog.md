# Catalogo Inicial de Emociones para Dialogos

Este documento define el set inicial oficial de emociones para nodos de dialogo.

## Emociones permitidas (v1)

- `neutral`: estado base del personaje, sin carga emocional fuerte.
- `confianza`: aprobacion, carisma suave, actitud positiva.
- `enojo`: tension, intensidad y desafio.
- `sorpresa`: reaccion inesperada, apertura emocional.
- `determinacion`: foco total en momentos clave.

## Uso sugerido

- Inicio/transicion: `neutral`.
- Respuesta favorable del jugador: `confianza`.
- Conflicto o presion: `enojo`.
- Resultado inesperado: `sorpresa`.
- Cierre de decision/poder: `determinacion`.

## Regla de implementacion

Para mantener consistencia entre entornos:

1. El seed de desarrollo y la migracion productiva deben usar los mismos valores.
2. Si se agrega una nueva emocion, actualizar este catalogo y los artefactos canonicos del dialogo.
3. Evitar sinonimos fuera del set oficial (por ejemplo `happy`, `focused`, `supportive`).
