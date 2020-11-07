USE FGOApp;

INSERT INTO `card types` (card_type, first_card_bonus) VALUES ('Buster', 'Adds an additional flat 50% damage increase to the card damage modifier, with no multiplicative scaling.'), 
('Arts', "Adds an additional 100% to the card's NP gain modifier."), ('Quick', '20% critical star rate.'), ('None', 'None');
INSERT INTO costs (cost_id, cost) VALUES (1, 0), (2, 1), (3, 3), (4, 4), (5, 5), (6, 7), (7, 8), (8, 9), (9, 12), (10, 16);
INSERT INTO attributes (attribute) VALUES ('Man'), ('Star'), ('Earth'), ('Beast'), ('Sky'),('None');