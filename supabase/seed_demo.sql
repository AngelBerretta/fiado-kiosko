-- ============================================================
-- Datos de demostración
-- Crea un kiosco de ejemplo ("demo-jurado") con 8 clientes
-- y ~2 meses de historial de movimientos, para poder probar
-- la app y los reportes sin cargar datos a mano.
--
-- Requiere haber corrido migration.sql previamente.
-- Se puede volver a correr sin problema: limpia los datos
-- demo anteriores antes de recrearlos.
-- ============================================================

do $$
declare
  v_kiosco_id uuid;
  v_roberto uuid;
  v_maria uuid;
  v_juan uuid;
  v_ana uuid;
  v_pedro uuid;
  v_lucia uuid;
  v_diego uuid;
  v_carla uuid;
begin
  -- Kiosco demo (slug fijo y fácil de recordar)
  insert into kioscos (nombre, slug_acceso)
  values ('Kiosco Don Mario (Demo)', 'demo-jurado')
  on conflict (slug_acceso) do update set nombre = excluded.nombre
  returning id into v_kiosco_id;

  -- Limpiar datos demo previos (por si se corre de nuevo)
  delete from movimientos where deudor_id in (select id from deudores where kiosco_id = v_kiosco_id);
  delete from deudores where kiosco_id = v_kiosco_id;

  -- Deudores
  insert into deudores (nombre, telefono, kiosco_id) values ('Roberto Gómez', '5491122334455', v_kiosco_id) returning id into v_roberto;
  insert into deudores (nombre, telefono, kiosco_id) values ('María Fernández', '5491133445566', v_kiosco_id) returning id into v_maria;
  insert into deudores (nombre, telefono, kiosco_id) values ('Juan Pérez', null, v_kiosco_id) returning id into v_juan;
  insert into deudores (nombre, telefono, kiosco_id) values ('Ana López', '5491144556677', v_kiosco_id) returning id into v_ana;
  insert into deudores (nombre, telefono, kiosco_id) values ('Pedro Sánchez', null, v_kiosco_id) returning id into v_pedro;
  insert into deudores (nombre, telefono, kiosco_id) values ('Lucía Torres', '5491155667788', v_kiosco_id) returning id into v_lucia;
  insert into deudores (nombre, telefono, kiosco_id) values ('Diego Martínez', null, v_kiosco_id) returning id into v_diego;
  insert into deudores (nombre, telefono, kiosco_id) values ('Carla Ibáñez', '5491166778899', v_kiosco_id) returning id into v_carla;

  -- Movimientos distribuidos en las últimas ~8 semanas
  -- (para que el gráfico de tendencia semanal se vea con curva real)

  -- Roberto: deuda alta y activa, movimientos recientes
  insert into movimientos (deudor_id, tipo, monto, detalle, created_at) values
    (v_roberto, 'DEUDA', 2500, 'Fiambre y pan', now() - interval '55 days'),
    (v_roberto, 'DEUDA', 1800, 'Gaseosas', now() - interval '40 days'),
    (v_roberto, 'PAGO', 1000, 'Pago parcial', now() - interval '25 days'),
    (v_roberto, 'DEUDA', 3200, 'Cigarrillos y golosinas', now() - interval '10 days'),
    (v_roberto, 'DEUDA', 900, 'Facturas', now() - interval '2 days');

  -- María: deuda media, cliente frecuente
  insert into movimientos (deudor_id, tipo, monto, detalle, created_at) values
    (v_maria, 'DEUDA', 1200, 'Leche y yerba', now() - interval '48 days'),
    (v_maria, 'DEUDA', 800, 'Pan', now() - interval '30 days'),
    (v_maria, 'PAGO', 500, 'Pago parcial', now() - interval '20 days'),
    (v_maria, 'DEUDA', 1500, 'Fideos y aceite', now() - interval '6 days');

  -- Juan: deuda baja, reciente
  insert into movimientos (deudor_id, tipo, monto, detalle, created_at) values
    (v_juan, 'DEUDA', 600, 'Gaseosa', now() - interval '15 days'),
    (v_juan, 'DEUDA', 450, 'Galletitas', now() - interval '3 days');

  -- Ana: deuda alta, sin pagos recientes
  insert into movimientos (deudor_id, tipo, monto, detalle, created_at) values
    (v_ana, 'DEUDA', 3000, 'Carne y verdura', now() - interval '52 days'),
    (v_ana, 'DEUDA', 2100, 'Bebidas para cumpleaños', now() - interval '35 days'),
    (v_ana, 'PAGO', 1000, 'Pago parcial', now() - interval '33 days');

  -- Pedro: deuda chica, muy reciente
  insert into movimientos (deudor_id, tipo, monto, detalle, created_at) values
    (v_pedro, 'DEUDA', 350, 'Cigarrillos', now() - interval '1 days');

  -- Lucía: deuda vieja sin movimientos recientes (deudor "abandonado")
  insert into movimientos (deudor_id, tipo, monto, detalle, created_at) values
    (v_lucia, 'DEUDA', 1900, 'Almacén variado', now() - interval '58 days'),
    (v_lucia, 'PAGO', 400, 'Pago parcial', now() - interval '50 days');

  -- Diego: varios movimientos, saldo bajo (casi saldado)
  insert into movimientos (deudor_id, tipo, monto, detalle, created_at) values
    (v_diego, 'DEUDA', 2200, 'Fiambrería', now() - interval '45 days'),
    (v_diego, 'PAGO', 1200, 'Pago parcial', now() - interval '38 days'),
    (v_diego, 'DEUDA', 700, 'Golosinas', now() - interval '18 days'),
    (v_diego, 'PAGO', 600, 'Pago parcial', now() - interval '9 days');

  -- Carla: pagó todo (saldo $0, no debería aparecer entre deudores activos)
  insert into movimientos (deudor_id, tipo, monto, detalle, created_at) values
    (v_carla, 'DEUDA', 1000, 'Kiosco variado', now() - interval '20 days'),
    (v_carla, 'PAGO', 1000, 'Pago total', now() - interval '5 days');

end $$;

-- ============================================================
-- Código de acceso para probar la demo: demo-jurado
-- ============================================================