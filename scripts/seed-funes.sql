-- Seed: 40 reclamos en Funes, Santa Fe, Argentina
-- Coordenadas reales dentro del ejido urbano de Funes (~-32.91 a -32.93 lat, -60.81 a -60.84 lng)

INSERT INTO reclamos (
  id, codigo_seguimiento, correlation_id, contact_key,
  canal, correo, dni, problema, direccion,
  lat, lng, categoria, prioridad, estado,
  observaciones, creado_en, actualizado_en
) VALUES

-- AGUA Y CLOACAS
('a1000001-0000-0000-0000-000000000001','FUN-001','corr-001','wa:5493415000001',
 'whatsapp',NULL,'30111001','Perdida de agua en vereda, lleva 3 dias','Av. San Martin 450, Funes',
 -32.9152,-60.8321,'agua_y_cloacas','alta','pendiente',NULL,NOW() - INTERVAL '5 days',NOW() - INTERVAL '5 days'),

('a1000001-0000-0000-0000-000000000002','FUN-002','corr-002','wa:5493415000002',
 'whatsapp',NULL,'30111002','Cloacas desbordadas frente a la escuela','Mitre 1230, Funes',
 -32.9178,-60.8298,'agua_y_cloacas','alta','pendiente',NULL,NOW() - INTERVAL '4 days',NOW() - INTERVAL '4 days'),

('a1000001-0000-0000-0000-000000000003','FUN-003','corr-003','wa:5493415000003',
 'web','vecino3@gmail.com','30111003','Perdida en ca\u00f1eria de agua corriente','Belgrano 780, Funes',
 -32.9163,-60.8340,'agua_y_cloacas','media','pendiente',NULL,NOW() - INTERVAL '3 days',NOW() - INTERVAL '3 days'),

('a1000001-0000-0000-0000-000000000004','FUN-004','corr-004','wa:5493415000004',
 'manual',NULL,'30111004','Humedad en calzada por fuga subterranea','25 de Mayo 560, Funes',
 -32.9145,-60.8310,'agua_y_cloacas','media','pendiente',NULL,NOW() - INTERVAL '2 days',NOW() - INTERVAL '2 days'),

-- ALUMBRADO
('a1000001-0000-0000-0000-000000000005','FUN-005','corr-005','wa:5493415000005',
 'whatsapp',NULL,'30111005','L\u00e1mpara de calle fundida hace una semana','Av. Presidente Per\u00f3n 1100, Funes',
 -32.9130,-60.8290,'alumbrado','media','pendiente',NULL,NOW() - INTERVAL '7 days',NOW() - INTERVAL '7 days'),

('a1000001-0000-0000-0000-000000000006','FUN-006','corr-006','wa:5493415000006',
 'whatsapp',NULL,'30111006','Poste de luz sin funcionar, zona oscura de noche','Los Pinos 345, Funes',
 -32.9210,-60.8355,'alumbrado','alta','pendiente',NULL,NOW() - INTERVAL '6 days',NOW() - INTERVAL '6 days'),

('a1000001-0000-0000-0000-000000000007','FUN-007','corr-007','wa:5493415000007',
 'email','luz7@gmail.com','30111007','Cable de alumbrado p\u00fablico ca\u00eddo sobre vereda','Int. Funes 230, Funes',
 -32.9198,-60.8320,'alumbrado','alta','pendiente',NULL,NOW() - INTERVAL '1 day',NOW() - INTERVAL '1 day'),

('a1000001-0000-0000-0000-000000000008','FUN-008','corr-008','wa:5493415000008',
 'web','vecino8@gmail.com','30111008','Alumbrado parpadea toda la noche, molestia vecinal','Sarmiento 890, Funes',
 -32.9170,-60.8275,'alumbrado','baja','pendiente',NULL,NOW() - INTERVAL '10 days',NOW() - INTERVAL '10 days'),

-- BACHES Y PAVIMENTO
('a1000001-0000-0000-0000-000000000009','FUN-009','corr-009','wa:5493415000009',
 'whatsapp',NULL,'30111009','Bache grande en carril derecho, peligro vehicular','Ruta Prov. 18 km 3, Funes',
 -32.9140,-60.8260,'baches_y_pavimento','alta','pendiente',NULL,NOW() - INTERVAL '8 days',NOW() - INTERVAL '8 days'),

('a1000001-0000-0000-0000-000000000010','FUN-010','corr-010','wa:5493415000010',
 'whatsapp',NULL,'30111010','Calzada hundida frente a vivienda, agua estancada','Moreno 670, Funes',
 -32.9185,-60.8330,'baches_y_pavimento','alta','pendiente',NULL,NOW() - INTERVAL '9 days',NOW() - INTERVAL '9 days'),

('a1000001-0000-0000-0000-000000000011','FUN-011','corr-011','wa:5493415000011',
 'manual',NULL,'30111011','M\u00faltiples baches en esquina, volantas rotas','Chacabuco esq. Rivadavia, Funes',
 -32.9155,-60.8308,'baches_y_pavimento','media','pendiente',NULL,NOW() - INTERVAL '5 days',NOW() - INTERVAL '5 days'),

('a1000001-0000-0000-0000-000000000012','FUN-012','corr-012','wa:5493415000012',
 'web','bache12@gmail.com','30111012','Pavimento deteriorado en calle sin asfaltar','El Ombu 123, Funes',
 -32.9220,-60.8345,'baches_y_pavimento','baja','pendiente',NULL,NOW() - INTERVAL '15 days',NOW() - INTERVAL '15 days'),

-- ARBOLADO
('a1000001-0000-0000-0000-000000000013','FUN-013','corr-013','wa:5493415000013',
 'whatsapp',NULL,'30111013','Rama ca\u00edda sobre vereda, obstruye paso peatonal','Los \u00c1lamos 456, Funes',
 -32.9160,-60.8350,'arbolado','alta','pendiente',NULL,NOW() - INTERVAL '2 days',NOW() - INTERVAL '2 days'),

('a1000001-0000-0000-0000-000000000014','FUN-014','corr-014','wa:5493415000014',
 'whatsapp',NULL,'30111014','\u00c1rbol inclinado peligrosamente sobre cableado el\u00e9ctrico','Lavalle 789, Funes',
 -32.9190,-60.8280,'arbolado','alta','pendiente',NULL,NOW() - INTERVAL '3 days',NOW() - INTERVAL '3 days'),

('a1000001-0000-0000-0000-000000000015','FUN-015','corr-015','wa:5493415000015',
 'manual',NULL,'30111015','Tronco seco que amenaza con caer al viento','Almafuerte 321, Funes',
 -32.9175,-60.8365,'arbolado','media','pendiente',NULL,NOW() - INTERVAL '6 days',NOW() - INTERVAL '6 days'),

('a1000001-0000-0000-0000-000000000016','FUN-016','corr-016','wa:5493415000016',
 'email','arbol16@gmail.com','30111016','Ra\u00edces levantan vereda y dificultan tr\u00e1nsito peatonal','San Lorenzo 654, Funes',
 -32.9135,-60.8300,'arbolado','baja','pendiente',NULL,NOW() - INTERVAL '20 days',NOW() - INTERVAL '20 days'),

-- RESIDUOS
('a1000001-0000-0000-0000-000000000017','FUN-017','corr-017','wa:5493415000017',
 'whatsapp',NULL,'30111017','Contenedor de basura desbordado hace 4 d\u00edas','Bolivar 1050, Funes',
 -32.9148,-60.8318,'residuos','media','pendiente',NULL,NOW() - INTERVAL '4 days',NOW() - INTERVAL '4 days'),

('a1000001-0000-0000-0000-000000000018','FUN-018','corr-018','wa:5493415000018',
 'whatsapp',NULL,'30111018','Microbasural en terreno baldio esquina','Cordoba esq. Tucuman, Funes',
 -32.9200,-60.8340,'residuos','media','pendiente',NULL,NOW() - INTERVAL '12 days',NOW() - INTERVAL '12 days'),

('a1000001-0000-0000-0000-000000000019','FUN-019','corr-019','wa:5493415000019',
 'web','residuos19@gmail.com','30111019','Basura acumulada en zanja por semanas','Juan B. Justo 890, Funes',
 -32.9165,-60.8290,'residuos','alta','pendiente',NULL,NOW() - INTERVAL '14 days',NOW() - INTERVAL '14 days'),

('a1000001-0000-0000-0000-000000000020','FUN-020','corr-020','wa:5493415000020',
 'manual',NULL,'30111020','Contenedor roto, residuos dispersos en calzada','9 de Julio 234, Funes',
 -32.9183,-60.8357,'residuos','baja','pendiente',NULL,NOW() - INTERVAL '7 days',NOW() - INTERVAL '7 days'),

-- ELECTRICIDAD
('a1000001-0000-0000-0000-000000000021','FUN-021','corr-021','wa:5493415000021',
 'whatsapp',NULL,'30111021','Cable el\u00e9ctrico ca\u00eddo en vereda p\u00fablica','Urquiza 567, Funes',
 -32.9142,-60.8325,'electricidad','alta','pendiente',NULL,NOW() - INTERVAL '1 day',NOW() - INTERVAL '1 day'),

('a1000001-0000-0000-0000-000000000022','FUN-022','corr-022','wa:5493415000022',
 'whatsapp',NULL,'30111022','Transformador haciendo ruido extra\u00f1o y olor a quemado','Reconquista 780, Funes',
 -32.9215,-60.8295,'electricidad','alta','pendiente',NULL,NOW() - INTERVAL '2 days',NOW() - INTERVAL '2 days'),

('a1000001-0000-0000-0000-000000000023','FUN-023','corr-023','wa:5493415000023',
 'email','elec23@gmail.com','30111023','Medidor da\u00f1ado por tormenta, sin suministro','Gemes 432, Funes',
 -32.9172,-60.8312,'electricidad','media','pendiente',NULL,NOW() - INTERVAL '3 days',NOW() - INTERVAL '3 days'),

-- GAS
('a1000001-0000-0000-0000-000000000024','FUN-024','corr-024','wa:5493415000024',
 'whatsapp',NULL,'30111024','Olor a gas en la v\u00eda p\u00fablica, posible fuga','Av. Belgrano 1340, Funes',
 -32.9157,-60.8270,'gas','alta','pendiente',NULL,NOW() - INTERVAL '6 hours',NOW() - INTERVAL '6 hours'),

('a1000001-0000-0000-0000-000000000025','FUN-025','corr-025','wa:5493415000025',
 'manual',NULL,'30111025','Ca\u00f1eria de gas expuesta despu\u00e9s de obras en calle','Roca 1100, Funes',
 -32.9195,-60.8310,'gas','alta','pendiente',NULL,NOW() - INTERVAL '1 day',NOW() - INTERVAL '1 day'),

('a1000001-0000-0000-0000-000000000026','FUN-026','corr-026','wa:5493415000026',
 'web','gas26@gmail.com','30111026','Regasificador da\u00f1ado en baldio municipal','Mitre 2100, Funes',
 -32.9228,-60.8360,'gas','media','pendiente',NULL,NOW() - INTERVAL '5 days',NOW() - INTERVAL '5 days'),

-- TRANSPORTE
('a1000001-0000-0000-0000-000000000027','FUN-027','corr-027','wa:5493415000027',
 'whatsapp',NULL,'30111027','Se\u00f1al de tr\u00e1nsito girada, genera confusi\u00f3n vial','Av. San Martin esq. Rivadavia, Funes',
 -32.9150,-60.8335,'transporte','media','pendiente',NULL,NOW() - INTERVAL '8 days',NOW() - INTERVAL '8 days'),

('a1000001-0000-0000-0000-000000000028','FUN-028','corr-028','wa:5493415000028',
 'manual',NULL,'30111028','Demarcaci\u00f3n peatonal borrada en cruce escolar','Sarmiento 1450, Funes',
 -32.9208,-60.8278,'transporte','alta','pendiente',NULL,NOW() - INTERVAL '11 days',NOW() - INTERVAL '11 days'),

('a1000001-0000-0000-0000-000000000029','FUN-029','corr-029','wa:5493415000029',
 'email','trans29@gmail.com','30111029','Sem\u00e1foro sin funcionar en horario pico','Av. Presidente Per\u00f3n esq. Belgrano, Funes',
 -32.9133,-60.8285,'transporte','alta','pendiente',NULL,NOW() - INTERVAL '2 days',NOW() - INTERVAL '2 days'),

-- INFRAESTRUCTURA
('a1000001-0000-0000-0000-000000000030','FUN-030','corr-030','wa:5493415000030',
 'whatsapp',NULL,'30111030','Cuneta desbordada, inundaci\u00f3n de calzada','Lavalle 1780, Funes',
 -32.9188,-60.8348,'infraestructura','alta','pendiente',NULL,NOW() - INTERVAL '3 days',NOW() - INTERVAL '3 days'),

('a1000001-0000-0000-0000-000000000031','FUN-031','corr-031','wa:5493415000031',
 'web','infra31@gmail.com','30111031','Tapa de acceso a alcantarilla rota, peligro de ca\u00edda','Moreno 345, Funes',
 -32.9143,-60.8305,'infraestructura','alta','pendiente',NULL,NOW() - INTERVAL '4 days',NOW() - INTERVAL '4 days'),

('a1000001-0000-0000-0000-000000000032','FUN-032','corr-032','wa:5493415000032',
 'manual',NULL,'30111032','Zanja abierta sin se\u00f1alizaci\u00f3n en obra municipal','Los Robles 890, Funes',
 -32.9222,-60.8332,'infraestructura','alta','pendiente',NULL,NOW() - INTERVAL '1 day',NOW() - INTERVAL '1 day'),

('a1000001-0000-0000-0000-000000000033','FUN-033','corr-033','wa:5493415000033',
 'whatsapp',NULL,'30111033','Muro perimetral del parque con grietas estructurales','Parque Municipal, Funes',
 -32.9168,-60.8370,'infraestructura','media','pendiente',NULL,NOW() - INTERVAL '18 days',NOW() - INTERVAL '18 days'),

-- OTROS
('a1000001-0000-0000-0000-000000000034','FUN-034','corr-034','wa:5493415000034',
 'whatsapp',NULL,'30111034','Pintadas vandal\u00edcas en pared del museo municipal','Museo Hist\u00f3rico, Belgrano 456, Funes',
 -32.9158,-60.8295,'otros','baja','pendiente',NULL,NOW() - INTERVAL '21 days',NOW() - INTERVAL '21 days'),

('a1000001-0000-0000-0000-000000000035','FUN-035','corr-035','wa:5493415000035',
 'manual',NULL,'30111035','Juegos infantiles del plazoleta deteriorados, peligrosos','Plazoleta 9 de Julio, Funes',
 -32.9177,-60.8360,'otros','media','pendiente',NULL,NOW() - INTERVAL '9 days',NOW() - INTERVAL '9 days'),

-- SEGUNDA TANDA: mas reclamos agua y cloacas + baches para tener masa critica en esas categorias
('a1000001-0000-0000-0000-000000000036','FUN-036','corr-036','wa:5493415000036',
 'whatsapp',NULL,'30111036','Fuga de agua debajo del asfalto, mancha humeda creciente','Los Eucaliptos 212, Funes',
 -32.9205,-60.8285,'agua_y_cloacas','alta','pendiente',NULL,NOW() - INTERVAL '6 days',NOW() - INTERVAL '6 days'),

('a1000001-0000-0000-0000-000000000037','FUN-037','corr-037','wa:5493415000037',
 'web','agua37@gmail.com','30111037','Presion de agua muy baja en todo el barrio Residencial','Residencial Norte, Funes',
 -32.9126,-60.8342,'agua_y_cloacas','media','pendiente',NULL,NOW() - INTERVAL '2 days',NOW() - INTERVAL '2 days'),

('a1000001-0000-0000-0000-000000000038','FUN-038','corr-038','wa:5493415000038',
 'whatsapp',NULL,'30111038','Bache profundo en acceso a barrio privado, da\u00f1a vehiculos','Acceso Norte, Funes',
 -32.9118,-60.8318,'baches_y_pavimento','alta','pendiente',NULL,NOW() - INTERVAL '5 days',NOW() - INTERVAL '5 days'),

('a1000001-0000-0000-0000-000000000039','FUN-039','corr-039','wa:5493415000039',
 'manual',NULL,'30111039','Tramo de calle sin pavimentar con charcos permanentes','Las Casuarinas 560, Funes',
 -32.9235,-60.8350,'baches_y_pavimento','media','pendiente',NULL,NOW() - INTERVAL '30 days',NOW() - INTERVAL '30 days'),

('a1000001-0000-0000-0000-000000000040','FUN-040','corr-040','wa:5493415000040',
 'whatsapp',NULL,'30111040','Alumbrado de plaza apagado, inseguridad nocturna','Plaza San Martin, Funes',
 -32.9160,-60.8315,'alumbrado','media','pendiente',NULL,NOW() - INTERVAL '13 days',NOW() - INTERVAL '13 days')

ON CONFLICT (id) DO NOTHING;
