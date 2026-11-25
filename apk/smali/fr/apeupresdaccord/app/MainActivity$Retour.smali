.class Lfr/apeupresdaccord/app/MainActivity$Retour;
.super Ljava/lang/Object;
.implements Landroid/window/OnBackInvokedCallback;
.source "MainActivity.java"

# Retour (Android 13 et plus) : d'abord l'historique de la page, puis l'appli passe en arrière-plan (la partie reste en mémoire)

.field final a:Lfr/apeupresdaccord/app/MainActivity;

.method constructor <init>(Lfr/apeupresdaccord/app/MainActivity;)V
    .registers 2
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lfr/apeupresdaccord/app/MainActivity$Retour;->a:Lfr/apeupresdaccord/app/MainActivity;
    return-void
.end method

.method public onBackInvoked()V
    .registers 4
    iget-object v0, p0, Lfr/apeupresdaccord/app/MainActivity$Retour;->a:Lfr/apeupresdaccord/app/MainActivity;
    iget-object v1, v0, Lfr/apeupresdaccord/app/MainActivity;->web:Landroid/webkit/WebView;
    if-eqz v1, :sortir
    invoke-virtual {v1}, Landroid/webkit/WebView;->canGoBack()Z
    move-result v2
    if-eqz v2, :sortir
    invoke-virtual {v1}, Landroid/webkit/WebView;->goBack()V
    return-void
    :sortir
    const/4 v2, 0x1
    invoke-virtual {v0, v2}, Landroid/app/Activity;->moveTaskToBack(Z)Z
    return-void
.end method
