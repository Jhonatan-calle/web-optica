-- ============================================================
-- Configuración global de la tienda (tabla "Configuracion").
-- Ejecutar en el SQL Editor de Supabase. Es IDEMPOTENTE: se puede
-- re-ejecutar sin errores (no pisa valores ya guardados).
--
-- Claves:
--   cuotas_cantidad     -> cantidad de cuotas (sin interés) del pago online.
--   cuotas_con_interes  -> si las cuotas llevan recargo de interés.
--   dias_producto_nuevo -> días para mostrar la etiqueta "NUEVO" en catálogo.
--
-- Los mismos valores se editan desde el panel admin (/admin/configuracion);
-- este script solo carga los defaults iniciales.
-- ============================================================

insert into "Configuracion" (id, clave, valor)
select gen_random_uuid()::text, clave, valor
from (values
    ('cuotas_cantidad', '3'),
    ('cuotas_con_interes', 'false'),
    ('dias_producto_nuevo', '21')
) as defaults (clave, valor)
on conflict (clave) do nothing;