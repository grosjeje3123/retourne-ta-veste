.class public Lfr/apeupresdaccord/app/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.java"

# L'appli tout entière : une WebView qui ouvre le site embarqué (assets/index.html).
# Les liens vers d'autres sites (les sources des cartes) s'ouvrent dans le navigateur.

.field public web:Landroid/webkit/WebView;

.method public constructor <init>()V
    .registers 1
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V
    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .registers 8
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    new-instance v0, Landroid/webkit/WebView;
    invoke-direct {v0, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V
    iput-object v0, p0, Lfr/apeupresdaccord/app/MainActivity;->web:Landroid/webkit/WebView;

    invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;
    move-result-object v1
    const/4 v2, 0x1
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowFileAccess(Z)V
    const/4 v3, 0x0
    invoke-virtual {v1, v3}, Landroid/webkit/WebSettings;->setMediaPlaybackRequiresUserGesture(Z)V
    const/16 v3, 0x64
    invoke-virtual {v1, v3}, Landroid/webkit/WebSettings;->setTextZoom(I)V

    new-instance v1, Lfr/apeupresdaccord/app/MainActivity$Liens;
    invoke-direct {v1, p0}, Lfr/apeupresdaccord/app/MainActivity$Liens;-><init>(Landroid/app/Activity;)V
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V

    # Fond nuit (#1a1736) pendant le chargement, pour éviter un éclair clair
    const v1, -0xe5e8ca
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setBackgroundColor(I)V

    # La page dans un cadre : sous Android 15 et plus (bord à bord imposé), le cadre se décale des barres système,
    # de l'encoche et du clavier ; ses marges prennent la couleur nuit des barres
    new-instance v4, Landroid/widget/FrameLayout;
    invoke-direct {v4, p0}, Landroid/widget/FrameLayout;-><init>(Landroid/content/Context;)V
    const v1, -0xeae8e6
    invoke-virtual {v4, v1}, Landroid/widget/FrameLayout;->setBackgroundColor(I)V
    new-instance v1, Landroid/widget/FrameLayout$LayoutParams;
    const/4 v2, -0x1
    invoke-direct {v1, v2, v2}, Landroid/widget/FrameLayout$LayoutParams;-><init>(II)V
    invoke-virtual {v4, v0, v1}, Landroid/widget/FrameLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V
    sget v1, Landroid/os/Build$VERSION;->SDK_INT:I
    const/16 v2, 0x23
    if-lt v1, v2, :sans_marges
    new-instance v1, Lfr/apeupresdaccord/app/MainActivity$Marges;
    invoke-direct {v1}, Lfr/apeupresdaccord/app/MainActivity$Marges;-><init>()V
    invoke-virtual {v4, v1}, Landroid/view/View;->setOnApplyWindowInsetsListener(Landroid/view/View$OnApplyWindowInsetsListener;)V
    :sans_marges
    invoke-virtual {p0, v4}, Landroid/app/Activity;->setContentView(Landroid/view/View;)V

    # Retour sous Android 13 et plus (retour prédictif, imposé avec la cible Android 16) : même logique que onBackPressed
    sget v1, Landroid/os/Build$VERSION;->SDK_INT:I
    const/16 v2, 0x21
    if-lt v1, v2, :sans_retour
    invoke-virtual {p0}, Landroid/app/Activity;->getOnBackInvokedDispatcher()Landroid/window/OnBackInvokedDispatcher;
    move-result-object v1
    new-instance v2, Lfr/apeupresdaccord/app/MainActivity$Retour;
    invoke-direct {v2, p0}, Lfr/apeupresdaccord/app/MainActivity$Retour;-><init>(Lfr/apeupresdaccord/app/MainActivity;)V
    const/4 v3, 0x0
    invoke-interface {v1, v3, v2}, Landroid/window/OnBackInvokedDispatcher;->registerOnBackInvokedCallback(ILandroid/window/OnBackInvokedCallback;)V
    :sans_retour

    const-string v1, "file:///android_asset/index.html#jouer"
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V
    invoke-direct {p0}, Lfr/apeupresdaccord/app/MainActivity;->pleinEcran()V
    return-void
.end method

# Plein écran immersif : barres d'état et de navigation masquées, elles reviennent un instant d'un glissement depuis le bord.
# Android 11 et plus : WindowInsetsController ; avant : les anciens drapeaux de la vue.
.method private pleinEcran()V
    .registers 4
    invoke-virtual {p0}, Landroid/app/Activity;->getWindow()Landroid/view/Window;
    move-result-object v0
    sget v1, Landroid/os/Build$VERSION;->SDK_INT:I
    const/16 v2, 0x1e
    if-lt v1, v2, :ancien
    invoke-virtual {v0}, Landroid/view/Window;->getInsetsController()Landroid/view/WindowInsetsController;
    move-result-object v0
    if-eqz v0, :fin
    invoke-static {}, Landroid/view/WindowInsets$Type;->systemBars()I
    move-result v1
    invoke-interface {v0, v1}, Landroid/view/WindowInsetsController;->hide(I)V
    const/4 v1, 0x2
    invoke-interface {v0, v1}, Landroid/view/WindowInsetsController;->setSystemBarsBehavior(I)V
    return-void
    :ancien
    invoke-virtual {v0}, Landroid/view/Window;->getDecorView()Landroid/view/View;
    move-result-object v0
    const/16 v1, 0x1706
    invoke-virtual {v0, v1}, Landroid/view/View;->setSystemUiVisibility(I)V
    :fin
    return-void
.end method

# Les barres reviennent quand on quitte puis retrouve la fenêtre : on les masque de nouveau
.method public onWindowFocusChanged(Z)V
    .registers 2
    invoke-super {p0, p1}, Landroid/app/Activity;->onWindowFocusChanged(Z)V
    if-eqz p1, :fin
    invoke-direct {p0}, Lfr/apeupresdaccord/app/MainActivity;->pleinEcran()V
    :fin
    return-void
.end method

# Retour : d'abord l'historique de la page (le jeu → les cartes), puis on quitte
.method public onBackPressed()V
    .registers 3
    iget-object v0, p0, Lfr/apeupresdaccord/app/MainActivity;->web:Landroid/webkit/WebView;
    if-eqz v0, :sortir
    invoke-virtual {v0}, Landroid/webkit/WebView;->canGoBack()Z
    move-result v1
    if-eqz v1, :sortir
    invoke-virtual {v0}, Landroid/webkit/WebView;->goBack()V
    return-void
    :sortir
    invoke-super {p0}, Landroid/app/Activity;->onBackPressed()V
    return-void
.end method

# En arrière-plan, la page se met en pause (minuteurs, sons)
.method protected onPause()V
    .registers 2
    invoke-super {p0}, Landroid/app/Activity;->onPause()V
    iget-object v0, p0, Lfr/apeupresdaccord/app/MainActivity;->web:Landroid/webkit/WebView;
    if-eqz v0, :fin
    invoke-virtual {v0}, Landroid/webkit/WebView;->onPause()V
    invoke-virtual {v0}, Landroid/webkit/WebView;->pauseTimers()V
    :fin
    return-void
.end method

.method protected onResume()V
    .registers 2
    invoke-super {p0}, Landroid/app/Activity;->onResume()V
    iget-object v0, p0, Lfr/apeupresdaccord/app/MainActivity;->web:Landroid/webkit/WebView;
    if-eqz v0, :fin
    invoke-virtual {v0}, Landroid/webkit/WebView;->resumeTimers()V
    invoke-virtual {v0}, Landroid/webkit/WebView;->onResume()V
    :fin
    return-void
.end method

.method protected onDestroy()V
    .registers 2
    iget-object v0, p0, Lfr/apeupresdaccord/app/MainActivity;->web:Landroid/webkit/WebView;
    if-eqz v0, :fin
    invoke-virtual {v0}, Landroid/webkit/WebView;->destroy()V
    :fin
    invoke-super {p0}, Landroid/app/Activity;->onDestroy()V
    return-void
.end method
