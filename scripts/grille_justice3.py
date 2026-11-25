P = '/home/claude/valeurs/bloc_donnees.js'
s = open(P, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)
rep("justice: 'Condamné en 2019 (3 mois avec sursis) pour rébellion et provocation lors de la perquisition de LFI. Comptes de campagne 2017&nbsp;: quatre mises en examen, dont son ex-directrice de communication&nbsp;; issue non connue.'",
    "justice: 'Condamné en 2019 (3 mois avec sursis) pour rébellion (perquisition de LFI). Comptes de sa campagne 2017&nbsp;: quatre proches ou prestataires mis en examen&nbsp;; issue non connue.'")
rep("justice: 'Condamnée en appel (2026) pour détournement de fonds publics (assistants FN)&nbsp;: 3 ans dont 1 ferme, 45 mois d’inéligibilité dont 30 avec sursis&nbsp;; pourvoi en cassation. Enquête judiciaire depuis 2024 sur sa campagne 2022. Présumée innocente.'",
    "justice: 'Condamnée en appel (2026) pour détournement de fonds publics (assistants FN)&nbsp;: 3 ans dont 1 ferme, 45 mois d’inéligibilité dont 30 avec sursis&nbsp;; en cassation, présumée innocente. Enquête judiciaire (2024) sur sa campagne 2022.'")
rep("Enquête préliminaire (2022) sur des SMS ciblés de sa campagne&nbsp;: issue non connue.'", "Enquête (2022) sur des SMS ciblés de sa campagne&nbsp;: issue non connue.'")
rep("['Le Courrier de l’Atlas (2022)',", "['Courrier de l’Atlas',")
rep("justice: 'Enquête judiciaire depuis 2024 sur le financement des campagnes du RN, dont les européennes 2024 qu’il menait&nbsp;; perquisition au siège en 2025. Issue non connue&nbsp;; présumé innocent.'",
    "justice: 'Enquête judiciaire (2024) sur le financement des campagnes du RN, dont les européennes 2024 qu’il menait. Issue non connue&nbsp;; présumé innocent.'")
open(P, 'w', encoding='utf-8').write(s); print('ok')
