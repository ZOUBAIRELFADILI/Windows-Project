/** Short, plain-language help for each screen. Shown by the "?" button. */
export type HelpTopic = 'dashboard' | 'products' | 'editor-steps' | 'editor-pricing' | 'editor-rules' | 'editor-test' | 'library' | 'orders' | 'promotions' | 'settings';

export const HELP: Record<HelpTopic, { title: string; intro: string; steps: string[] }> = {
  dashboard: {
    title: 'Le tableau de bord',
    intro: 'Votre point de départ chaque matin.',
    steps: ['Regardez les « Tâches à traiter » : chaque bouton ouvre directement le bon écran.', 'Suivez la checklist « Mon premier produit » si vous débutez.', 'Les chiffres se mettent à jour à chaque nouvelle commande.'],
  },
  products: {
    title: 'Les produits',
    intro: 'Un produit = un configurateur que le client remplit étape par étape.',
    steps: ['Cliquez « Créer un produit » et partez d’un modèle existant : c’est le plus rapide.', 'Le score « Prêt à … % » indique ce qu’il manque avant de publier.', 'Rien n’est visible en boutique tant que vous n’avez pas cliqué « Publier ».'],
  },
  'editor-steps': {
    title: 'Étapes & options',
    intro: 'Ce que le client choisit, dans l’ordre où il le choisit.',
    steps: ['À gauche : les étapes. Utilisez les flèches pour changer l’ordre, l’interrupteur pour masquer une étape.', 'Au centre : les options de l’étape. Cliquez une carte pour modifier son nom, son image ou son prix.', 'À droite : l’aperçu exact de ce que voit le client.'],
  },
  'editor-pricing': {
    title: 'Les grilles de prix',
    intro: 'Le prix de base dépend de la largeur et de la hauteur.',
    steps: ['Une grille par nombre de vantaux. Les cases orange sont des prix manquants.', 'Collez vos prix depuis Excel ou cliquez une case pour la modifier.', '« Remplir automatiquement » calcule les cases vides à partir des voisines.', 'Utilisez « Tester un prix » pour vérifier une dimension.'],
  },
  'editor-rules': {
    title: 'Les règles',
    intro: 'Les règles empêchent les combinaisons impossibles.',
    steps: ['Chaque règle se lit comme une phrase : « Quand … alors … ».', 'L’interrupteur active ou désactive une règle sans la supprimer.', 'Un bandeau rouge signale deux règles qui se contredisent.'],
  },
  'editor-test': {
    title: 'Tester comme un client',
    intro: 'Vérifiez tout avant de publier.',
    steps: ['Faites vos choix comme un client : le prix se recalcule à chaque clic.', 'Le détail du prix montre chaque ligne de calcul.', 'Les avertissements indiquent les règles déclenchées.'],
  },
  library: {
    title: 'La bibliothèque d’options',
    intro: 'Créez une option une seule fois, utilisez-la dans tous vos produits.',
    steps: ['Modifier une option ici la met à jour dans tous les produits qui l’utilisent.', 'Chaque produit peut quand même avoir son propre prix pour cette option.', 'Sélectionnez plusieurs cartes pour changer leurs prix en une fois.'],
  },
  orders: {
    title: 'Les commandes',
    intro: 'Chaque commande garde le prix du jour où elle a été passée.',
    steps: ['Cliquez une ligne pour voir la fiche technique et le détail du prix.', 'Changez le statut au fur et à mesure de la fabrication.', 'Téléchargez la fiche de fabrication pour l’atelier ou le fournisseur.'],
  },
  promotions: {
    title: 'Les promotions',
    intro: 'Une remise en % appliquée au total du produit.',
    steps: ['Activez ou désactivez une promotion en un clic.', 'Chaque produit peut être rattaché à une promotion dans son éditeur.'],
  },
  settings: {
    title: 'Les paramètres',
    intro: 'Réglages de la démo.',
    steps: ['« Réinitialiser » remet les données de démonstration d’origine.', '« Relancer la visite » rejoue le tour guidé.'],
  },
};

export const TOUR = [
  { target: 'nav', title: 'Le menu', text: 'Tout est ici : vos produits, la bibliothèque d’options partagées, les promotions et les commandes.' },
  { target: 'checklist', title: 'Mon premier produit', text: 'Suivez cette checklist : elle vous guide de la création jusqu’à la publication.' },
  { target: 'tasks', title: 'Tâches à traiter', text: 'Les problèmes à corriger s’affichent ici, avec un bouton qui ouvre directement le bon écran.' },
  { target: 'assistant', title: 'L’assistant IA', text: 'Posez une question ou demandez une modification. L’assistant propose, vous validez : rien n’est appliqué sans votre accord.' },
];
