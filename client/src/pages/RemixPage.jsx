import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDevice } from '../contexts/DeviceContext';
import { Copy, ExternalLink, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const RemixPage = () => {
  const { remixId } = useParams();
  const navigate = useNavigate();
  const { loadTemplateData, takeSnapshot } = useDevice();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remixData, setRemixData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load remix data on mount
  useEffect(() => {
    const loadRemix = async () => {
      if (!remixId) {
        setError('Invalid remix link');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Loading remix:', remixId);
        
        // Import remixService dynamically
        const { default: remixService } = await import('../services/remixService');
        const data = await remixService.getRemix(remixId);
        setRemixData(data);
        
        console.log('✅ Remix data loaded:', data);
      } catch (err) {
        console.error('❌ Failed to load remix:', err);
        setError(err.message || 'Failed to load remix');
      } finally {
        setLoading(false);
      }
    };

    loadRemix();
  }, [remixId]);

  // Convert remix device_state to your template format
  const convertRemixToTemplate = (remixData) => {
    const { device_state } = remixData;
    
    console.log('🔄 Converting remix to template:', device_state);
    
    // Map remix schema to your internal state structure
    const templateData = {
      deviceInfo: {
        name: "Remixed QR Wallpaper",
        type: "iPhone 15 Pro Max",
        size: { x: 1290, y: 2796 }
      },
      background: {
        style: device_state.bg.type,
        color: device_state.bg.type === 'solid' ? device_state.bg.activeTypeValue : "#FFFFFF",
        bg: device_state.bg.type === 'image' ? device_state.bg.activeTypeValue : "",
        gradient: device_state.bg.type === 'gradient' ? device_state.bg.activeTypeValue : {
          type: "linear",
          stops: [0, "rgb(255, 170, 0)", 0.5, "rgb(228,88,191)", 1, "rgb(177,99,232)"],
          angle: 0,
          pos: { x: 0.5, y: 0.5 }
        },
        grain: device_state.bg.grain || false
      },
      qrConfig: {
        url: "www.qrki.com",
        scale: device_state.qr.scale || 0.5,
        custom: {
          primaryColor: device_state.qr.primaryColor,
          secondaryColor: device_state.qr.secondaryColor,
          borderColor: device_state.qr.borderColor,
          borderSizeRatio: device_state.qr.borderWidth,
          cornerRadiusRatio: device_state.qr.borderRadius
        },
        positionPercentages: {
          x: device_state.qr.pos.x,
          y: device_state.qr.pos.y
        },
        rotation: device_state.qr.rotation || 0
      },
      imagePalette: [],
      uploadInfo: {
        filename: null,
        originalImageData: null,
        croppedImageData: null,
        crop: null
      },
      generatedInfo: {
        filename: null,
        originalImageData: null,
        croppedImageData: null,
        crop: null
      }
    };

    console.log('✅ Template data converted:', templateData);
    return templateData;
  };

  const handleStartRemixing = async () => {
    if (!remixData) return;

    try {
      setIsLoading(true);
      
      console.log('🎨 Starting remix process...');
      
      // Convert remix data to template format
      const templateData = convertRemixToTemplate(remixData);
      
      // Load the template data using your existing function
      loadTemplateData(templateData);
      
      // Take a snapshot for undo/redo
      takeSnapshot('Loaded remix design');
      
      console.log('✅ Template loaded, navigating to studio...');
      
      // Navigate to studio
      navigate('/studio');
      
      toast.success('Remix loaded! Start customizing your design.', {
        position: "bottom-right",
        autoClose: 3000,
      });
      
    } catch (err) {
      console.error('❌ Failed to start remixing:', err);
      toast.error('Failed to load remix. Please try again.', {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyRemixLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success('Remix link copied to clipboard!', {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link', {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] mx-auto" />
          <p className="text-[var(--text-secondary)]">Loading remix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Remix Not Found
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              {error === 'Remix not found or has expired' 
                ? 'This remix link has expired or the design is no longer available.'
                : error
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your Own Design
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full border border-[var(--border-color)] text-[var(--text-primary)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                QRKi
              </h1>
              <span className="text-[var(--text-secondary)]">•</span>
              <span className="text-[var(--text-secondary)]">Remix</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={copyRemixLink}
                className="flex items-center space-x-2 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </button>
              
              <a
                href="/"
                className="flex items-center space-x-2 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">QRKi Home</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                QR Wallpaper Design
              </h2>
              <p className="text-[var(--text-secondary)] text-lg">
                A custom QR code wallpaper design ready to be remixed and made your own!
              </p>
            </div>

            <div className="flex items-center space-x-6 text-sm text-[var(--text-secondary)]">
              <div>
                <span className="font-medium">{remixData.view_count || 0}</span> views
              </div>
              <div>
                Created {formatDate(remixData.created_at)}
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-[var(--text-primary)]">
                🎨 Ready to Remix?
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">
                This design will be loaded into the QRKi studio where you can customize colors, 
                position, size, and more. Make it uniquely yours!
              </p>
              
              <button
                onClick={handleStartRemixing}
                disabled={isLoading}
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Start Remixing</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            <div className="aspect-[9/16] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[var(--accent)]/20 rounded-lg flex items-center justify-center mx-auto">
                  <div className="w-8 h-8 bg-[var(--accent)] rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-[var(--bg-main)] rounded w-24 mx-auto" />
                  <div className="h-2 bg-[var(--bg-main)] rounded w-16 mx-auto" />
                </div>
              </div>
            </div>
            
            <p className="text-center text-xs text-[var(--text-secondary)]">
              Live preview coming in a future update
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-[var(--text-secondary)]">
          <p>Create your own QR wallpapers at <a href="/" className="text-[var(--accent)] hover:underline">QRKi.com</a></p>
        </div>
      </footer>
    </div>
  );
};

export default RemixPage;