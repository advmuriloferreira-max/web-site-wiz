-- Atualizar provisao_bcb352_anexo1 com dados OFICIAIS da BCB 352/2023

-- Limpar dados anteriores
DELETE FROM public.provisao_bcb352_anexo1;

-- Inserir dados OFICIAIS do Anexo I (Perda Incorrida - >90 dias)
INSERT INTO public.provisao_bcb352_anexo1 (faixa_meses, meses_min, meses_max, c1_percentual, c2_percentual, c3_percentual, c4_percentual, c5_percentual) VALUES
('Menor que 1 mês', 0, 1, 5.5, 30.0, 45.0, 35.0, 50.0),
('1-2 meses', 1, 2, 10.0, 33.4, 48.7, 39.5, 53.4),
('2-3 meses', 2, 3, 14.5, 36.8, 52.4, 44.0, 56.8),
('3-4 meses', 3, 4, 19.0, 40.2, 56.1, 48.5, 60.2),
('4-5 meses', 4, 5, 23.5, 43.6, 59.8, 53.0, 63.6),
('5-6 meses', 5, 6, 28.0, 47.0, 63.5, 57.5, 67.0),
('6-7 meses', 6, 7, 32.5, 50.4, 67.2, 62.0, 70.4),
('7-8 meses', 7, 8, 37.0, 53.8, 70.9, 66.5, 73.8),
('8-9 meses', 8, 9, 41.5, 57.2, 74.6, 71.0, 77.2),
('9-10 meses', 9, 10, 46.0, 60.6, 78.3, 75.5, 80.6),
('10-11 meses', 10, 11, 50.5, 64.0, 82.0, 80.0, 84.0),
('11-12 meses', 11, 12, 55.0, 67.4, 85.7, 84.5, 87.4),
('12-13 meses', 12, 13, 59.5, 70.8, 89.4, 89.0, 90.8),
('13-14 meses', 13, 14, 64.0, 74.2, 93.1, 93.5, 94.2),
('14-15 meses', 14, 15, 68.5, 77.6, 96.8, 98.0, 97.6),
('15-16 meses', 15, 16, 73.0, 81.0, 100.0, 100.0, 100.0),
('16-17 meses', 16, 17, 77.5, 84.4, 100.0, 100.0, 100.0),
('17-18 meses', 17, 18, 82.0, 87.8, 100.0, 100.0, 100.0),
('18-19 meses', 18, 19, 86.5, 91.2, 100.0, 100.0, 100.0),
('19-20 meses', 19, 20, 91.0, 94.6, 100.0, 100.0, 100.0),
('20-21 meses', 20, 21, 95.5, 98.0, 100.0, 100.0, 100.0),
('21+ meses', 21, NULL, 100.0, 100.0, 100.0, 100.0, 100.0);

-- Comentário de validação
COMMENT ON TABLE public.provisao_bcb352_anexo1 IS 'Anexo I - BCB 352/2023: Provisão para ativos >90 dias. Total: 22 faixas. C3/C4/C5 atingem 100% aos 15 meses. C1/C2 atingem 100% aos 21 meses.';