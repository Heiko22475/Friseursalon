import React, { useEffect, useState } from 'react';
import { useWebsite, LogoDesign } from '../../contexts/WebsiteContext';
import {
  HeroConfig, HeroButton, HeroText, HeroLogo,
  Viewport, Position, HorizontalPosition, VerticalPosition,
  getResponsiveValue, createDefaultHeroConfig
} from '../../types/Hero';
import { EditableText } from '../admin/EditableText';

interface HeroProps {
  config?: HeroConfig;
  instanceId?: number;
  blockId?: string;
}

export const Hero: React.FC<HeroProps> = ({ config: propConfig, instanceId, blockId }) => {
  const { website } = useWebsite();
  const [currentViewport, setCurrentViewport] = useState<Viewport>('desktop');
  
  // Get config from props or default - ensure all required fields exist
  const defaultConfig = createDefaultHeroConfig();
  const config: HeroConfig = propConfig ? {
    ...defaultConfig,
    ...propConfig,
    height: propConfig.height || defaultConfig.height,
    logos: propConfig.logos || defaultConfig.logos,
    texts: propConfig.texts || defaultConfig.texts,
    buttons: propConfig.buttons || defaultConfig.buttons,
    overlay: propConfig.overlay || defaultConfig.overlay,
    backgroundPosition: propConfig.backgroundPosition || defaultConfig.backgroundPosition,
  } : defaultConfig;
  
  const logos = website?.logos || [];

  // Detect viewport
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentViewport('mobile');
      } else if (width < 1024) {
        setCurrentViewport('tablet');
      } else {
        setCurrentViewport('desktop');
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const height = getResponsiveValue(config.height, currentViewport);

  // Filter visible elements
  const visibleLogos = config.logos.filter(l => getResponsiveValue(l.visible, currentViewport));
  const visibleTexts = config.texts.filter(t => getResponsiveValue(t.visible, currentViewport));
  const visibleButtons = config.buttons.filter(b => getResponsiveValue(b.visible, currentViewport));

  // Separate elements on/below image
  const onImageLogos = visibleLogos.filter(l => !getResponsiveValue(l.belowImage, currentViewport));
  const onImageTexts = visibleTexts.filter(t => !getResponsiveValue(t.belowImage, currentViewport));
  const onImageButtons = visibleButtons.filter(b => !getResponsiveValue(b.belowImage, currentViewport));

  const belowImageLogos = visibleLogos.filter(l => getResponsiveValue(l.belowImage, currentViewport));
  const belowImageTexts = visibleTexts.filter(t => getResponsiveValue(t.belowImage, currentViewport));
  const belowImageButtons = visibleButtons.filter(b => getResponsiveValue(b.belowImage, currentViewport));

  const hasBelowImageContent = belowImageLogos.length > 0 || belowImageTexts.length > 0 || belowImageButtons.length > 0;

  // Handle button actions
  const handleButtonClick = (button: HeroButton) => {
    switch (button.action.type) {
      case 'link':
        window.location.href = button.action.value;
        break;
      case 'scroll':
        const element = document.getElementById(button.action.value);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      case 'phone':
        window.location.href = `tel:${button.action.value}`;
        break;
      case 'email':
        window.location.href = `mailto:${button.action.value}`;
        break;
    }
  };

  return (
    <div id={`hero-v2-${instanceId || 'default'}`}>
      {/* Main Hero Image Area */}
      <div 
        className="relative overflow-hidden w-full"
        style={{
          height,
          backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: `${config.backgroundPosition.x}% ${config.backgroundPosition.y}%`,
          backgroundColor: config.backgroundImage ? undefined : '#374151'
        }}
      >
        {/* Overlay */}
        {config.overlay.enabled && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: config.overlay.color,
              opacity: config.overlay.opacity / 100
            }}
          />
        )}

        {/* Logos on Image */}
        {onImageLogos.map((heroLogo) => {
          const logo = logos.find(l => l.id === heroLogo.logoId);
          if (!logo) return null;
          return (
            <LogoRenderer 
              key={heroLogo.id}
              heroLogo={heroLogo}
              logo={logo}
              viewport={currentViewport}
            />
          );
        })}

        {/* Texts on Image */}
        {onImageTexts.map((text, index) => {
          const textIndex = config.texts.findIndex(t => t.id === text.id);
          return (
            <TextRenderer
              key={text.id}
              text={text}
              viewport={currentViewport}
              blockId={blockId}
              textIndex={textIndex}
            />
          );
        })}

        {/* Buttons on Image */}
        {onImageButtons.map((button) => (
          <ButtonRenderer
            key={button.id}
            button={button}
            viewport={currentViewport}
            onClick={() => handleButtonClick(button)}
          />
        ))}
      </div>

      {/* Below Image Content */}
      {hasBelowImageContent && (
        <div className="bg-white py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6 text-center">
            {/* Logos below */}
            {belowImageLogos.map((heroLogo) => {
              const logo = logos.find(l => l.id === heroLogo.logoId);
              if (!logo) return null;
              const scale = getResponsiveValue(heroLogo.scale, currentViewport) / 100;
              return (
                <div key={heroLogo.id} className="flex justify-center">
                  <LogoSvg logo={logo} scale={scale} />
                </div>
              );
            })}

            {/* Texts below */}
            {belowImageTexts.map((text, index) => {
              const fontSize = getResponsiveValue(text.fontSize, currentViewport);
              const textIndex = config.texts.findIndex(t => t.id === text.id);
              
              return blockId ? (
                <EditableText
                  key={text.id}
                  blockId={blockId}
                  fieldPath={`texts[${textIndex}].content`}
                  value={text.content}
                  as="div"
                  className="whitespace-pre-wrap"
                  style={{
                    fontFamily: text.fontFamily,
                    fontSize: `${fontSize}px`,
                    fontWeight: text.fontWeight,
                    color: text.color
                  }}
                  multiline
                />
              ) : (
                <div
                  key={text.id}
                  className="whitespace-pre-wrap"
                  style={{
                    fontFamily: text.fontFamily,
                    fontSize: `${fontSize}px`,
                    fontWeight: text.fontWeight,
                    color: text.color
                  }}
                  dangerouslySetInnerHTML={{ __html: text.content }}
                />
              );
            })}

            {/* Buttons below */}
            <div className="flex flex-wrap justify-center gap-4">
              {belowImageButtons.map((button) => (
                <HeroButtonComponent
                  key={button.id}
                  button={button}
                  onClick={() => handleButtonClick(button)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Logo Renderer (positioned on image)
interface LogoRendererProps {
  heroLogo: HeroLogo;
  logo: LogoDesign;
  viewport: Viewport;
}

const LogoRenderer: React.FC<LogoRendererProps> = ({ heroLogo, logo, viewport }) => {
  const position = getResponsiveValue(heroLogo.position, viewport);
  const scale = getResponsiveValue(heroLogo.scale, viewport) / 100;
  
  const posStyle = getPositionStyle(position);

  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        ...posStyle,
        transform: `translate(-50%, -50%) scale(${scale})`
      }}
    >
      <LogoSvg logo={logo} scale={1} />
    </div>
  );
};

// Logo SVG Renderer
interface LogoSvgProps {
  logo: LogoDesign;
  scale: number;
}

const LogoSvg: React.FC<LogoSvgProps> = ({ logo, scale }) => {
  const width = logo.canvas.width * scale;
  const height = logo.canvas.height * scale;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${logo.canvas.width} ${logo.canvas.height}`}
    >
      {/* Background */}
      {logo.canvas.backgroundColor !== 'transparent' && (
        <rect 
          width={logo.canvas.width} 
          height={logo.canvas.height} 
          fill={logo.canvas.backgroundColor} 
        />
      )}
      
      {/* Image */}
      {logo.image && (
        <image
          href={logo.image.url}
          x={logo.image.x}
          y={logo.image.y}
          width={logo.image.width}
          height={logo.image.height}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      
      {/* Texts */}
      {logo.texts.map((text) => (
        <text
          key={text.id}
          x={text.x}
          y={text.y}
          fontFamily={text.fontFamily}
          fontSize={text.fontSize}
          fontWeight={text.fontWeight}
          fill={text.color}
          letterSpacing={text.letterSpacing}
          dominantBaseline="hanging"
        >
          {text.content}
        </text>
      ))}
    </svg>
  );
};

// Text Renderer (positioned on image)
interface TextRendererProps {
  text: HeroText;
  viewport: Viewport;
  blockId?: string;
  textIndex: number;
}

const TextRenderer: React.FC<TextRendererProps> = ({ text, viewport, blockId, textIndex }) => {
  const position = getResponsiveValue(text.position, viewport);
  const fontSize = getResponsiveValue(text.fontSize, viewport);
  
  const posStyle = getPositionStyle(position);

  if (blockId) {
    return (
      <div className="absolute" style={posStyle}>
        <EditableText
          blockId={blockId}
          fieldPath={`texts[${textIndex}].content`}
          value={text.content}
          as="div"
          className="whitespace-pre-wrap text-center max-w-[90%]"
          style={{
            fontFamily: text.fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight: text.fontWeight,
            color: text.color
          }}
          multiline
        />
      </div>
    );
  }

  return (
    <div 
      className="absolute whitespace-pre-wrap text-center max-w-[90%]"
      style={{
        ...posStyle,
        fontFamily: text.fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight: text.fontWeight,
        color: text.color
      }}
      dangerouslySetInnerHTML={{ __html: text.content }}
    />
  );
};

// Button Renderer (positioned on image)
interface ButtonRendererProps {
  button: HeroButton;
  viewport: Viewport;
  onClick: () => void;
}

const ButtonRenderer: React.FC<ButtonRendererProps> = ({ button, viewport, onClick }) => {
  const position = getResponsiveValue(button.position, viewport);
  const posStyle = getPositionStyle(position);

  return (
    <div 
      className="absolute"
      style={posStyle}
    >
      <HeroButtonComponent button={button} onClick={onClick} />
    </div>
  );
};

// Reusable Button Component
interface HeroButtonComponentProps {
  button: HeroButton;
  onClick: () => void;
}

const HeroButtonComponent: React.FC<HeroButtonComponentProps> = ({ button, onClick }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition cursor-pointer";
  
  const sizeStyles = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };
  
  const radiusStyles = {
    none: 'rounded-none',
    small: 'rounded',
    medium: 'rounded-lg',
    large: 'rounded-xl',
    pill: 'rounded-full'
  };
  
  const variantStyles = {
    primary: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-700 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-white text-white hover:bg-white hover:text-gray-900',
    custom: ''
  };

  const customStyle = button.style.variant === 'custom' ? {
    backgroundColor: button.style.backgroundColor,
    color: button.style.textColor,
    borderColor: button.style.borderColor,
    borderWidth: '2px',
    borderStyle: 'solid' as const
  } : {};

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[button.style.size]} ${radiusStyles[button.style.borderRadius]} ${variantStyles[button.style.variant]}`}
      style={customStyle}
    >
      {button.text}
    </button>
  );
};

// Helper: Get position style
const getPositionStyle = (position: Position): React.CSSProperties => {
  const horizontalPercents: Record<HorizontalPosition, number> = {
    'left': 10, 'left-center': 25, 'center': 50, 'right-center': 75, 'right': 90
  };
  const verticalPercents: Record<VerticalPosition, number> = {
    'top': 10, 'top-center': 30, 'middle': 50, 'bottom-center': 70, 'bottom': 90
  };

  return {
    left: `${horizontalPercents[position.horizontal] + position.offsetX}%`,
    top: `${verticalPercents[position.vertical] + position.offsetY}%`,
    transform: 'translate(-50%, -50%)'
  };
};

export default Hero;
