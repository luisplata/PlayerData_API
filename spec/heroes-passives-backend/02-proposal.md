# Proposal - heroes-passives-backend

## Intent
Implementar Heroes con pasivas en backend propio, con validacion server-side y asignacion atomica.

## In Scope
- CreateHero
- GetHeroList
- StartDialog (sin respuestas)
- SendAnswer (validacion y asignacion de pasiva)
- GetPassive (pasiva del jugador + catalogo)

## Out of Scope
- Aplicar efectos gameplay en cliente
- UI administrativa

## Affected Areas
- Entidades: Hero, Passive, Dialog, DialogQuestion, PlayerPassive
- Repositorios y casos de uso asociados
- Controladores y rutas
- Migraciones DB

## Risks and Mitigations
- Consistencia: transacciones y constraints unicos
- Seguridad: nunca exponer respuestas
- Rendimiento: indices y paginacion

## Rollback
Desregistrar rutas nuevas sin afectar endpoints existentes.

## Success Criteria
- Endpoints funcionales y validados
- StartDialog no expone respuestas
- SendAnswer asigna pasiva de forma consistente
