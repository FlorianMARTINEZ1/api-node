# Projet NodeJS

## Route /articles

Cette route permet de récupérer la totalité des articles.

## Route /articles/:id

Cette route permet de récupérer les informations de l'article d'id ":id".

## Route /newArticle

Cette route permet de créer un article. Elle est accessible qu'aux personnes connecté. Elle récupère les données "nom", "description" et "prix" du body. Elle ajoute également l'email de l'utilsateur pour que seul cet utilisateur puisse le modifier et le supprimer.

## Route /removeArticle/:id

Cette route permet de supprimer l'article ":id" si l'utilisateur connecté est celui qui l'a créé.

## Route /update/:id

Cette route permet de mettre à jour l'article ":id". Si l'utilisateur connecté est celui qui l'a créé, alors elle récupère les champs à modifier du body et envoi la requête.

## Route /newAccount

Cette route permet de créer un utilisateur. Elle récupère les données "email" et "password" du body. Il renvoit un token JWT.

## Route /login

Cette route récupère les données "email" et "password" du body et signe l'email avec un token.
