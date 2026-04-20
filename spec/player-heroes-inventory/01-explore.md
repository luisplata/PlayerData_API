# Explore - player-heroes-inventory

## Current State
El backend ya maneja heroes, dialogs, preguntas y asignacion de pasivas en el flujo `heroes-passives-backend`.

## Problem
Falta un endpoint de perfil que permita consultar todos los heroes de un player, junto con su nivel de progreso en la relacion player-heroe, devolviendo una estructura estable para los heroes que todavia no tienen datos.

## Considered Approaches
1. Agregar un endpoint de inventario por player que devuelva todos los heroes con nivel.
2. Reutilizar el endpoint de pasivas actual y expandirlo con metadatos de progreso.
3. Exponer heroes ya iniciados y los demas con datos por defecto para conservar la misma forma de respuesta.

## Recommendation
Agregar un endpoint dedicado de inventario por player. Mantiene la respuesta clara, evita mezclar el estado de pasiva con el estado de progreso y permite devolver todos los heroes con valores por defecto cuando no existe historial.

## Risks
- Definir con precision el significado de "nivel".
- Alinear la respuesta con el flujo existente de `/api/v1/heroes/dialog/answer`.
- Evitar confundir progreso de dialogo con la pasiva final asignada.