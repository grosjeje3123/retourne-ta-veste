import com.reandroid.apk.*;
import java.io.File;

/** Petit outil autour d'ARSCLib : decode <apk> <dossier> | build <dossier> <apk> */
public class Outil {
    public static void main(String[] a) throws Exception {
        if (a[0].equals("decode")) {
            ApkModule m = ApkModule.loadApkFile(new File(a[1]));
            ApkModuleXmlDecoder d = new ApkModuleXmlDecoder(m);
            d.decode(new File(a[2]));
        } else if (a[0].equals("build")) {
            ApkModuleXmlEncoder e = new ApkModuleXmlEncoder();
            e.scanDirectory(new File(a[1]));
            ApkModule m = e.getApkModule();
            m.writeApk(new File(a[2]));
        }
        System.out.println("ok");
    }
}
