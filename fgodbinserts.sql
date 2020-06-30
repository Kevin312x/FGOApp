USE FGOApp;

INSERT INTO `card types` (card_type, first_card_bonus) VALUES ('Buster', 'Adds an additional flat 50% damage increase to the card damage modifier, with no multiplicative scaling.'), 
('Arts', "Adds an additional 100% to the card's NP gain modifier."), ('Quick', '20% critical star rate.');
INSERT INTO costs (cost_id, cost) VALUES (1, 1), (2, 3), (3, 4), (4, 5), (5, 7), (6, 9), (7, 12), (8, 16);
INSERT INTO attributes (attribute) VALUES ('Man', 'Star', 'Earth', 'Star', 'Beast');
INSERT INTO traits (trait) VALUES ('Argo-Related', 'Athur', 'Beast', "Brynhildr's Beloved", 'Demonic', 
'Divine', 'Dragon', 'Earth or Sky', 'Greek Mythology Males', 'Humanoid', 'Illya', 'King', 'Living Human', 
'Large', 'Pseudo-Servants', 'Demi-Servants', 'Riding', 'Roman', 'Saberface', 'Threat to Humanity', 'Unknown Gender', 'Weak to Enuma Elish');