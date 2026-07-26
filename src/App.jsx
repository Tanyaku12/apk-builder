import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Globe, 
  Package, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Settings2, 
  ShieldCheck, 
  Layers, 
  Code2, 
  Palette, 
  RefreshCw, 
  ExternalLink,
  WifiOff,
  Zap,
  Info,
  ChevronRight,
  Terminal,
  FileText,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
  Link as LinkIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';

export default function App() {
  // Primary User Inputs (as requested)
  const [appName, setAppName] = useState('Blinx Web App');
  const [packageName, setPackageName] = useState('builder.apk.blinx');
  const [backendUrl, setBackendUrl] = useState('https://blinx.app');

  // Extended Customization State
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const defaultAppIcon = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
  const [appIcon, setAppIcon] = useState(defaultAppIcon);
  const [iconMode, setIconMode] = useState('upload'); // 'upload' | 'url'
  const [isDragging, setIsDragging] = useState(false);

  // Permissions & Features Switches
  const [enableCamera, setEnableCamera] = useState(true);
  const [enableLocation, setEnableLocation] = useState(false);
  const [enablePushNotification, setEnablePushNotification] = useState(true);
  const [enableOfflineCache, setEnableOfflineCache] = useState(true);
  const [pullToRefresh, setPullToRefresh] = useState(true);
  const [enableJavaScript, setEnableJavaScript] = useState(true);
  const [hideStatusBar, setHideStatusBar] = useState(false);

  // App UI State
  const [activeTab, setActiveTab] = useState('config'); // config, preview, code, build
  const [copiedField, setCopiedField] = useState(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [simulatedUrl, setSimulatedUrl] = useState('');
  const [previewDevice, setPreviewDevice] = useState('android'); // android, tablet

  useEffect(() => {
    setSimulatedUrl(backendUrl);
  }, [backendUrl]);

  // Validation functions
  const isPackageValid = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i.test(packageName);
  const isUrlValid = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(backendUrl);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Generate Config XML for Cordova/PhoneGap/Capacitor
  const getConfigXml = () => {
    return `<?xml version='1.0' encoding='utf-8'?>
<widget id="${packageName}" version="${appVersion}" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>${appName}</name>
    <description>APK Wrapper untuk ${backendUrl}</description>
    <author email="dev@${packageName}">Blinx APK Builder</author>
    <content src="${backendUrl}" />
    <access origin="*" />
    <allow-navigation href="${backendUrl}/*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    
    <preference name="Orientation" value="${orientation}" />
    <preference name="BackgroundColor" value="${themeColor}" />
    <preference name="Fullscreen" value="${hideStatusBar}" />
    <preference name="DisallowOverscroll" value="${!pullToRefresh}" />
    
    <plugin name="cordova-plugin-whitelist" version="1.3.4" />
    ${enablePushNotification ? '<plugin name="phonegap-plugin-push" version="2.3.0" />' : ''}
    ${enableCamera ? '<plugin name="cordova-plugin-camera" version="4.1.0" />' : ''}
    ${enableLocation ? '<plugin name="cordova-plugin-geolocation" version="4.0.2" />' : ''}
</widget>`;
  };

  // Generate AndroidManifest.xml
  const getAndroidManifest = () => {
    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}"
    android:versionCode="1"
    android:versionName="${appVersion}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    ${enableCamera ? '<uses-permission android:name="android.permission.CAMERA" />' : ''}
    ${enableLocation ? '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />' : ''}
    ${enablePushNotification ? '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />' : ''}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale"
            android:screenOrientation="${orientation}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
  };

  // Generate MainActivity.java for Webview Wrapper
  const getMainActivityJava = () => {
    const packageParts = packageName.split('.');
    const packageDecl = `package ${packageName};`;

    return `${packageDecl}

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(${enableJavaScript});
        settings.setDomStorageEnabled(${enableOfflineCache});
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setUserAgentString("BlinxAPKWrapper/1.0 (Android)");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        webView.loadUrl("${backendUrl}");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`;
  };

  // Generate GitHub Action Build Workflow file (.github/workflows/build-apk.yml)
  const getGithubWorkflowYaml = () => {
    return `name: Build Android APK (${appName})

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v3

    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Setup Android SDK
      uses: android-actions/setup-android@v2

    - name: Build APK with Gradle
      run: |
        chmod +x ./gradlew || true
        ./gradlew assembleDebug

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v3
      with:
        name: ${appName.replace(/\s+/g, '_')}-${appVersion}.apk
        path: app/build/outputs/apk/debug/app-debug.apk
`;
  };

  // Generate Full Zip Project Download
  const downloadZipProject = async () => {
    setIsGeneratingZip(true);
    const zip = new JSZip();

    // Directory structure
    zip.file("config.xml", getConfigXml());
    zip.file("AndroidManifest.xml", getAndroidManifest());
    zip.file("MainActivity.java", getMainActivityJava());
    zip.file("README.md", `# Project APK Builder: ${appName}\n\nPackage Name: ${packageName}\nBackend URL: ${backendUrl}\nVersion: ${appVersion}\n\nGenerated via Blinx APK Builder Web App.`);

    const githubFolder = zip.folder(".github/workflows");
    githubFolder.file("build-apk.yml", getGithubWorkflowYaml());

    // Generate blob and trigger download
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${packageName.replace(/\./g, '_')}_src.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsGeneratingZip(false);
    triggerConfetti();
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Top Bar Header */}
      <header style={{
        borderBottom: '1px solid var(--border-light)',
        background: 'rgba(9, 13, 22, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Smartphone color="#fff" size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                  Blinx <span className="glow-text">APK Builder</span>
                </h1>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary-light)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  v2.5 PRO
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ubah Website Anda Menjadi Aplikasi Android (APK) Instan & Professional
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveTab(activeTab === 'preview' ? 'config' : 'preview')}
              style={{ fontSize: '0.88rem' }}
            >
              <Smartphone size={16} />
              {activeTab === 'preview' ? 'Tutup Preview' : 'Live Phone Preview'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '32px auto 0', padding: '0 24px' }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '6px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          width: 'fit-content',
          marginBottom: '28px'
        }}>
          {[
            { id: 'config', label: '1. Input & Konfigurasi', icon: Settings2 },
            { id: 'features', label: '2. Pengaturan APK & Fitur', icon: ShieldCheck },
            { id: 'build', label: '3. Download APK', icon: Download }
          ].map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Layout Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: activeTab === 'config' ? '1fr 380px' : '1fr', 
          gap: '32px', 
          alignItems: 'start' 
        }}>
          
          {/* LEFT SIDE: Active Tab Content */}
          <div>
            {/* TAB 1: Main Form Input */}
            {activeTab === 'config' && (
              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <Sparkles color="var(--primary-light)" size={22} />
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Informasi Utama Aplikasi</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Masukkan 3 informasi wajib di bawah ini untuk memulai builder APK Anda.
                    </p>
                  </div>
                </div>

                {/* 1. Nama APK */}
                <div className="input-group">
                  <label className="input-label">
                    <Smartphone size={16} color="var(--primary-light)" />
                    Nama Aplikasi (App Name) *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Blinx Store"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                  />
                  <span className="input-hint">Nama yang akan tampil di home screen Android pengguna.</span>
                </div>

                {/* 2. Nama Paket APK */}
                <div className="input-group">
                  <label className="input-label">
                    <Package size={16} color="var(--accent-cyan)" />
                    Nama Paket APK (Package ID) *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="builder.apk.blinx"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    style={{
                      borderColor: isPackageValid ? 'var(--border-light)' : '#ef4444'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="input-hint">
                      Format unik: com.domain.namaapp atau <code>builder.apk.blinx</code>
                    </span>
                    {!isPackageValid && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>
                        Format Package ID tidak valid!
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Link Website Backend */}
                <div className="input-group">
                  <label className="input-label">
                    <Globe size={16} color="var(--accent-pink)" />
                    Link Website Backend / Target URL *
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://blinx.app atau https://my-backend.com"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    style={{
                      borderColor: isUrlValid ? 'var(--border-light)' : '#ef4444'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="input-hint">
                      URL website yang akan dimasukkan ke dalam WebView APK.
                    </span>
                    {!isUrlValid && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>
                        Gunakan prefix http:// atau https://
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Branding Inputs */}
                <div style={{
                  marginTop: '28px',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px'
                }}>
                  <div className="input-group">
                    <label className="input-label">
                      <Palette size={16} color="var(--accent-amber)" />
                      Warna Tema (Theme Color)
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          background: 'none'
                        }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      <Layers size={16} color="var(--accent-green)" />
                      Versi Aplikasi (Version)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="1.0.0"
                      value={appVersion}
                      onChange={(e) => setAppVersion(e.target.value)}
                    />
                  </div>
                </div>

                {/* Enhanced App Icon Section (Drag & Drop + URL Tabs) */}
                <div className="input-group" style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="input-label" style={{ marginBottom: 0 }}>
                      <ImageIcon size={16} color="var(--primary-light)" />
                      Ikon Aplikasi (App Icon)
                    </label>
                    
                    {/* Tab Switcher: Upload vs URL */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.8)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <button
                        type="button"
                        onClick={() => setIconMode('upload')}
                        style={{
                          background: iconMode === 'upload' ? 'var(--primary)' : 'transparent',
                          color: iconMode === 'upload' ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Upload size={13} />
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setIconMode('url')}
                        style={{
                          background: iconMode === 'url' ? 'var(--primary)' : 'transparent',
                          color: iconMode === 'url' ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <LinkIcon size={13} />
                        URL / Link
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: DRAG & DROP UPLOAD AREA */}
                  {iconMode === 'upload' ? (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
                      {/* Big Interactive Preview Thumbnail */}
                      <div style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '20px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '2px solid var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                        position: 'relative'
                      }}>
                        <img 
                          src={appIcon} 
                          alt="App Icon Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = defaultAppIcon; }}
                        />
                      </div>

                      {/* Dropzone Container */}
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              setAppIcon(uploadEvent.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{
                          flex: 1,
                          border: `2px dashed ${isDragging ? 'var(--primary-light)' : 'rgba(255,255,255,0.15)'}`,
                          borderRadius: 'var(--radius-md)',
                          background: isDragging ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.4)',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          transition: 'all 0.25s ease',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <Upload size={18} color="var(--primary-light)" />
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                            Seret & Lepas Gambar ke Sini
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                          atau pilih file dari perangkat (PNG / JPG persegi)
                        </p>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <label className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem', cursor: 'pointer' }}>
                            Pilih File Gambar
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (uploadEvent) => {
                                    setAppIcon(uploadEvent.target.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {appIcon !== defaultAppIcon && (
                            <button
                              type="button"
                              onClick={() => setAppIcon(defaultAppIcon)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              title="Reset Ikon Default"
                            >
                              <RotateCcw size={14} />
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* TAB 2: INPUT URL & PRESET OPTIONS */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid var(--border-light)',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <img 
                            src={appIcon} 
                            alt="Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = defaultAppIcon; }}
                          />
                        </div>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="https://domain.com/path-to-icon.png"
                          value={appIcon}
                          onChange={(e) => setAppIcon(e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>

                      {/* Quick Presets */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preset Pilihan:</span>
                        {[
                          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1614680376593-902f749f7edc?w=200&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&auto=format&fit=crop&q=80'
                        ].map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAppIcon(url)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              border: appIcon === url ? '2px solid var(--primary-light)' : '1px solid var(--border-light)',
                              padding: 0,
                              overflow: 'hidden',
                              cursor: 'pointer'
                            }}
                          >
                            <img src={url} alt="preset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="input-hint" style={{ marginTop: '8px' }}>
                    Ukuran ideal ikon adalah 512x512 piksel (Format PNG / JPG persegi). Ikon ini akan tampil pada launcher Android.
                  </span>
                </div>

                {/* Quick Action Button */}
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('features')}
                  >
                    Lanjut ke Fitur & Perizinan
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Fitur & Permission Controls */}
            {activeTab === 'features' && (
              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <ShieldCheck color="var(--accent-green)" size={22} />
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Pengaturan Perizinan & Hardware</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Aktifkan hak akses Android dan optimasi WebView sesuai kebutuhan web Anda.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Camera Permission */}
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <span className="toggle-title">Izin Kamera (Camera Access)</span>
                      <span className="toggle-desc">Dibutuhkan jika website menggunakan upload foto / scan QR Code.</span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={enableCamera} 
                        onChange={(e) => setEnableCamera(e.target.checked)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  {/* Location Permission */}
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <span className="toggle-title">Izin Lokasi (GPS Geolocation)</span>
                      <span className="toggle-desc">Izinkan aplikasi mengakses koordinat GPS pengguna.</span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={enableLocation} 
                        onChange={(e) => setEnableLocation(e.target.checked)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  {/* Push Notifications */}
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <span className="toggle-title">Push Notifications</span>
                      <span className="toggle-desc">Dukungan notifikasi push via OneSignal / Firebase.</span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={enablePushNotification} 
                        onChange={(e) => setEnablePushNotification(e.target.checked)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  {/* Offline Cache & DOM Storage */}
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <span className="toggle-title">Offline Cache & DOM Storage</span>
                      <span className="toggle-desc">Simpan cache aset agar website dapat dimuat lebih cepat.</span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={enableOfflineCache} 
                        onChange={(e) => setEnableOfflineCache(e.target.checked)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  {/* Pull To Refresh */}
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <span className="toggle-title">Pull-to-Refresh Gestures</span>
                      <span className="toggle-desc">Pengguna dapat menarik ke bawah untuk reload halaman web.</span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={pullToRefresh} 
                        onChange={(e) => setPullToRefresh(e.target.checked)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  {/* Hide Status Bar */}
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <span className="toggle-title">Fullscreen Mode (Hide Status Bar)</span>
                      <span className="toggle-desc">Sembunyikan jam dan status bar bawaan HP untuk tampilan immersive.</span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={hideStatusBar} 
                        onChange={(e) => setHideStatusBar(e.target.checked)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                {/* Orientasi Layar */}
                <div style={{ marginTop: '24px' }}>
                  <label className="input-label" style={{ marginBottom: '10px' }}>
                    Orientasi Layar (Screen Orientation)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {[
                      { id: 'portrait', label: 'Portrait (Tegak)' },
                      { id: 'landscape', label: 'Landscape (Mendatar)' },
                      { id: 'unspecified', label: 'Auto Rotate' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setOrientation(item.id)}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: orientation === item.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                          background: orientation === item.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(10, 15, 26, 0.5)',
                          color: orientation === item.id ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('config')}
                  >
                    Kembali
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('build')}
                  >
                    Lanjut ke Download APK
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Download APK */}
            {activeTab === 'build' && (
              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Download color="var(--accent-green)" size={24} />
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Download APK Application</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Unduh file proyek aplikasi {appName} yang telah terkonfigurasi secara lengkap.
                    </p>
                  </div>
                </div>

                {/* Primary Download Action Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--accent-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                  }}>
                    <Download size={28} color="#fff" />
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>
                    File Proyek Siap Diunduh!
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                    Unduh paket <code>.ZIP</code> berisi seluruh file konfigurasi native Android, <strong>AndroidManifest.xml</strong>, ikon aplikasi, dan kode WebView.
                  </p>

                  <button 
                    className="btn btn-success"
                    onClick={downloadZipProject}
                    disabled={isGeneratingZip || !isPackageValid || !isUrlValid}
                    style={{ 
                      padding: '14px 28px', 
                      fontSize: '1rem', 
                      fontWeight: '700',
                      boxShadow: '0 6px 25px rgba(16, 185, 129, 0.4)' 
                    }}
                  >
                    {isGeneratingZip ? (
                      <>
                        <RefreshCw size={18} className="animated-pulse" style={{ animation: 'spin 1s linear infinite' }} />
                        Membuat File ZIP...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Download File Proyek (.ZIP)
                      </>
                    )}
                  </button>
                </div>

                {/* Build Guide Accordion */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Zap size={18} color="var(--primary-light)" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Langkah Compile Menjadi File APK (.apk):</h4>
                  </div>
                  <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    <li>Klik tombol <strong>Download File Proyek (.ZIP)</strong> di atas.</li>
                    <li>Ekstrak file `.zip` ke komputer Anda atau upload langsung ke <strong>GitHub Repository</strong>.</li>
                    <li>Jalankan perintah <code>cordova build android --release</code> atau manfaatkan fitur <strong>GitHub Actions</strong> untuk compile otomatis file APK tanpa laptop canggih.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

              {/* RIGHT SIDE: Interactive Device Simulator Mockup (Hanya tampil di Tab 1: config) */}
              {activeTab === 'config' && (
                <div>
                  <div style={{
                    position: 'sticky',
                    top: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                  {/* Header & Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={16} /> Live Device Preview
                    </span>
                    
                    {/* Device Selector Controls */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.8)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <button
                        onClick={() => setPreviewDevice('android')}
                        style={{
                          background: previewDevice === 'android' ? 'var(--primary)' : 'transparent',
                          color: previewDevice === 'android' ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                        title="Smartphone View"
                      >
                        Phone
                      </button>
                      <button
                        onClick={() => setPreviewDevice('tablet')}
                        style={{
                          background: previewDevice === 'tablet' ? 'var(--primary)' : 'transparent',
                          color: previewDevice === 'tablet' ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                        title="Tablet View"
                      >
                        Tablet
                      </button>
                    </div>
                  </div>

                  {/* Device Frame */}
                  <div style={{
                    width: previewDevice === 'tablet' ? '360px' : '320px',
                    height: previewDevice === 'tablet' ? '540px' : '620px',
                    background: '#090a0f',
                    borderRadius: previewDevice === 'tablet' ? '28px' : '40px',
                    border: `8px solid ${themeColor}`,
                    boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${themeColor}40`,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    
                    {/* Speaker & Camera Notch */}
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: previewDevice === 'tablet' ? '80px' : '120px',
                      height: '22px',
                      background: themeColor,
                      borderBottomLeftRadius: '14px',
                      borderBottomRightRadius: '14px',
                      zIndex: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000' }}></div>
                      {previewDevice !== 'tablet' && (
                        <div style={{ width: '35px', height: '4px', borderRadius: '2px', background: 'rgba(0,0,0,0.5)' }}></div>
                      )}
                    </div>

                    {/* Status Bar */}
                    {!hideStatusBar && (
                      <div style={{
                        height: '32px',
                        background: 'rgba(0,0,0,0.8)',
                        padding: '8px 18px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: '#fff',
                        zIndex: 10
                      }}>
                        <span>15:40</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span>5G</span>
                          <div style={{ width: '16px', height: '8px', border: '1px solid #fff', borderRadius: '2px', padding: '1px' }}>
                            <div style={{ width: '70%', height: '100%', background: '#fff' }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* App Bar / Header inside phone */}
                    <div style={{
                      background: themeColor,
                      padding: hideStatusBar ? '32px 14px 10px' : '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#fff',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={appIcon} 
                          alt="Icon" 
                          style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'; }}
                        />
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: previewDevice === 'tablet' ? '200px' : '160px' }}>
                          {appName || 'Nama Aplikasi'}
                        </span>
                      </div>
                      <a 
                        href={backendUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: '#fff', display: 'flex', opacity: 0.8 }}
                        title="Buka Website di Tab Baru"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>

                    {/* Simulated WebView Content */}
                    <div style={{ flex: 1, background: '#fff', position: 'relative', overflow: 'hidden' }}>
                      {isUrlValid ? (
                        <iframe
                          src={backendUrl}
                          title="APK Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                          }}
                          onError={() => setSimulatedUrl('')}
                        />
                      ) : (
                        <div style={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '24px',
                          textAlign: 'center',
                          color: '#475569',
                          background: '#f8fafc'
                        }}>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px'
                          }}>
                            <AlertCircle size={28} color="#ef4444" />
                          </div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                            URL Tidak Valid
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                            Masukkan URL Website backend yang valid (dimulai dengan http:// atau https://) untuk melihat preview WebView.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Android Bottom Navigation Bar */}
                    <div style={{
                      height: '34px',
                      background: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around'
                    }}>
                      <div style={{ width: '12px', height: '12px', borderLeft: '2px solid #aaa', borderBottom: '2px solid #aaa', transform: 'rotate(45deg)' }}></div>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #aaa' }}></div>
                      <div style={{ width: '12px', height: '12px', border: '2px solid #aaa', borderRadius: '2px' }}></div>
                    </div>
                  </div>

                  {/* Package & Info Badge Summary */}
                  <div style={{
                    marginTop: '16px',
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.7)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TARGET PACKAGE & VERSI</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <code style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {packageName || 'builder.apk.blinx'}
                      </code>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                        v{appVersion}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}

        </div>
      </main>
    </div>
  );
}
