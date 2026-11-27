.class final Lfr/apeupresdaccord/app/MainActivity$Liens;
.super Landroid/webkit/WebViewClient;
.source "MainActivity.java"

# Les adresses http(s) partent dans le navigateur ; le reste (fichiers de l'appli) reste dans la WebView

.field private final activite:Landroid/app/Activity;

.method constructor <init>(Landroid/app/Activity;)V
    .registers 2
    invoke-direct {p0}, Landroid/webkit/WebViewClient;-><init>()V
    iput-object p1, p0, Lfr/apeupresdaccord/app/MainActivity$Liens;->activite:Landroid/app/Activity;
    return-void
.end method

.method public shouldOverrideUrlLoading(Landroid/webkit/WebView;Landroid/webkit/WebResourceRequest;)Z
    .registers 7
    invoke-interface {p2}, Landroid/webkit/WebResourceRequest;->getUrl()Landroid/net/Uri;
    move-result-object v0
    invoke-virtual {v0}, Landroid/net/Uri;->getScheme()Ljava/lang/String;
    move-result-object v1
    const-string v2, "http"
    invoke-virtual {v2, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v3
    if-nez v3, :externe
    const-string v2, "https"
    invoke-virtual {v2, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v3
    if-nez v3, :externe
    const/4 v3, 0x0
    return v3

    :externe
    new-instance v2, Landroid/content/Intent;
    const-string v3, "android.intent.action.VIEW"
    invoke-direct {v2, v3, v0}, Landroid/content/Intent;-><init>(Ljava/lang/String;Landroid/net/Uri;)V
    iget-object v3, p0, Lfr/apeupresdaccord/app/MainActivity$Liens;->activite:Landroid/app/Activity;
    :debut
    invoke-virtual {v3, v2}, Landroid/app/Activity;->startActivity(Landroid/content/Intent;)V
    :fin
    .catch Ljava/lang/Exception; {:debut .. :fin} :fini
    :fini
    const/4 v3, 0x1
    return v3
.end method
