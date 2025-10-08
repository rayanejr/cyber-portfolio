-- Supprimer les anciens projets (les 16 premiers avant la migration)
DELETE FROM projects WHERE id IN (
  '0b44c4c1-9cc2-45c5-94cb-bf8295ab199b',
  'a8fb5532-05a8-4dcb-b24d-2287544596da',
  '6d78cb58-d245-4373-b133-e1ff37481694',
  'ff5aa3d6-6182-4567-8486-26d15155a7b6',
  'eba3d9c8-bd98-4219-bc2e-d5cc5803ad7b',
  '97fbe801-944f-46b0-b112-4e0a40cfe298',
  '2660dcc8-812c-492e-aa9b-a074cf5ddc73',
  '67716f0f-f16f-4fbf-a0d6-b7e6f216f7a6',
  'ab4842c6-6aef-4661-9922-22b55139f4a2',
  '05bcdf06-dfe0-41b8-b78f-84519d4ac237',
  'fabf1f30-e9b7-4219-9508-0502832b2d2d',
  '87231658-0f96-4204-85ce-228b5f6348ac',
  'bcc886e3-52e0-4791-88d2-68dca1f9d072',
  '50d06660-8758-44bf-92e0-1b3f8b87ec6a',
  '20413ff4-64c3-42ad-94e4-26368fa03072',
  '83604777-8cb9-41d2-bd27-6db43e786bf0'
);