import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

// Comprehensive list of available Lucide icons
const AVAILABLE_ICONS = [
  'Accessibility', 'Activity', 'Airplay', 'AlertCircle', 'AlertOctagon', 'AlertTriangle', 'AlignCenter',
  'AlignJustify', 'AlignLeft', 'AlignRight', 'Anchor', 'Aperture', 'Archive', 'ArrowDown', 'ArrowDownCircle',
  'ArrowDownLeft', 'ArrowDownRight', 'ArrowLeft', 'ArrowLeftCircle', 'ArrowRight', 'ArrowRightCircle',
  'ArrowUp', 'ArrowUpCircle', 'ArrowUpLeft', 'ArrowUpRight', 'Award', 'BarChart', 'BarChart2', 'Battery',
  'BatteryCharging', 'Bell', 'BellOff', 'Bluetooth', 'Bold', 'Book', 'BookOpen', 'Bookmark', 'Box',
  'Briefcase', 'Brush', 'Calendar', 'Camera', 'CameraOff', 'Cast', 'Check', 'CheckCircle', 'CheckSquare',
  'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronsDown', 'ChevronsLeft', 'ChevronsRight',
  'ChevronsUp', 'Chrome', 'Circle', 'Clipboard', 'Clock', 'Cloud', 'CloudDrizzle', 'CloudLightning',
  'CloudOff', 'CloudRain', 'CloudSnow', 'Code', 'Codepen', 'Coffee', 'Command', 'Compass', 'Copy',
  'CornerDownLeft', 'CornerDownRight', 'CornerLeftDown', 'CornerLeftUp', 'CornerRightDown', 'CornerRightUp',
  'CornerUpLeft', 'CornerUpRight', 'Cpu', 'CreditCard', 'Crop', 'Crosshair', 'Crown', 'Database', 'Delete',
  'Disc', 'DollarSign', 'Download', 'DownloadCloud', 'Droplet', 'Edit', 'Edit2', 'Edit3', 'ExternalLink',
  'Eye', 'EyeOff', 'Facebook', 'FastForward', 'Feather', 'File', 'FileText', 'Film', 'Filter', 'Flag',
  'Folder', 'FolderPlus', 'Frown', 'Gift', 'GitBranch', 'GitCommit', 'GitMerge', 'GitPullRequest', 'Github',
  'Gitlab', 'Globe', 'Grid', 'HardDrive', 'Hash', 'Headphones', 'Heart', 'HelpCircle', 'Home', 'Image',
  'Inbox', 'Info', 'Instagram', 'Italic', 'Layers', 'Layout', 'LifeBuoy', 'Link', 'Link2', 'Linkedin',
  'List', 'Loader', 'Lock', 'LogIn', 'LogOut', 'Mail', 'Map', 'MapPin', 'Maximize', 'Maximize2', 'Meh',
  'Menu', 'MessageCircle', 'MessageSquare', 'Mic', 'MicOff', 'Minimize', 'Minimize2', 'MinusCircle',
  'MinusSquare', 'Monitor', 'Moon', 'MoreHorizontal', 'MoreVertical', 'MousePointer', 'Move', 'Music',
  'Navigation', 'Navigation2', 'Octagon', 'Package', 'Paperclip', 'Pause', 'PauseCircle', 'Pen', 'Percent',
  'Phone', 'PhoneCall', 'PhoneForwarded', 'PhoneIncoming', 'PhoneMissed', 'PhoneOff', 'PhoneOutgoing',
  'PieChart', 'Play', 'PlayCircle', 'Plus', 'PlusCircle', 'PlusSquare', 'Pocket', 'Power', 'Printer',
  'Radio', 'RefreshCw', 'Repeat', 'Rewind', 'RotateCcw', 'RotateCw', 'Rss', 'Save', 'Scissors', 'Search',
  'Send', 'Server', 'Settings', 'Share', 'Share2', 'Shield', 'ShieldOff', 'ShoppingBag', 'ShoppingCart',
  'Shuffle', 'Sidebar', 'SkipBack', 'SkipForward', 'Slack', 'Slash', 'Sliders', 'Smartphone', 'Smile',
  'Speaker', 'Square', 'Star', 'StopCircle', 'Sun', 'Sunrise', 'Sunset', 'Tablet', 'Tag', 'Target',
  'Terminal', 'Thermometer', 'ThumbsDown', 'ThumbsUp', 'ToggleLeft', 'ToggleRight', 'Trash', 'Trash2',
  'TrendingDown', 'TrendingUp', 'Triangle', 'Truck', 'Tv', 'Twitter', 'Type', 'Umbrella', 'Underline',
  'Unlock', 'Upload', 'UploadCloud', 'User', 'UserCheck', 'UserMinus', 'UserPlus', 'UserX', 'Users',
  'Video', 'VideoOff', 'Voicemail', 'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Watch', 'Wifi', 'WifiOff',
  'Wind', 'X', 'XCircle', 'XSquare', 'Youtube', 'Zap', 'ZapOff', 'ZoomIn', 'ZoomOut',
  'Sparkles', 'Palette', 'Lightbulb', 'Gem', 'Flame', 'Leaf', 'Waves', 'Flower', 'TreePine', 'Mountain'
];

// Popular icons for services
const POPULAR_ICONS = [
  'Scissors', 'Sparkles', 'Heart', 'Star', 'Users', 'Palette', 'Brush', 'Crown',
  'Smile', 'Coffee', 'Home', 'ShoppingBag', 'Gift', 'Award', 'Zap', 'Target',
  'Clock', 'Calendar', 'Phone', 'Mail', 'MapPin', 'Camera', 'Image', 'Music',
];

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use predefined icon list
  const allIconNames = useMemo(() => {
    return AVAILABLE_ICONS.sort();
  }, []);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchTerm) {
      // Show popular icons first, then rest
      const remaining = allIconNames.filter(name => !POPULAR_ICONS.includes(name));
      return [...POPULAR_ICONS, ...remaining];
    }
    const searchLower = searchTerm.toLowerCase().trim();
    return allIconNames.filter(name =>
      name.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, allIconNames]);

  const CurrentIcon = LucideIcons[value as keyof typeof LucideIcons] as React.FC<{ size?: number }>;

  return (
    <div className="relative">
      {/* Selected Icon Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-2 border rounded-lg transition"
        style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border-strong)' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--admin-accent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--admin-border-strong)')}
      >
        {CurrentIcon && <CurrentIcon size={24} />}
        <span className="flex-1 text-left">{value}</span>
        <span style={{ color: 'var(--admin-text-muted)' }}>▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Icon Grid */}
          <div className="absolute z-50 mt-2 w-full min-w-[550px] border rounded-lg max-h-96 overflow-hidden" style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border-strong)', boxShadow: 'var(--admin-shadow-lg)' }}>
            {/* Search Bar */}
            <div className="p-3 border-b sticky top-0" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg-card)' }}>
              <div className="relative">
                <Search className="absolute left-3 top-2.5" style={{ color: 'var(--admin-text-muted)' }} size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search icons..."
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)' }}
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5"
                    style={{ color: 'var(--admin-text-muted)' }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--admin-text-muted)' }}>
                {filteredIcons.length} icons available
              </p>
            </div>

            {/* Icons Grid */}
            <div className="p-3 overflow-y-auto max-h-80">
              {!searchTerm && (
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--admin-text-secondary)' }}>
                    Popular Icons
                  </p>
                  <div className="grid grid-cols-6 gap-2 pb-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                    {POPULAR_ICONS.map((iconName) => {
                      const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<{ size?: number }>;
                      if (!IconComponent) return null;

                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            onChange(iconName);
                            setIsOpen(false);
                            setSearchTerm('');
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg transition"
                          style={value === iconName ? { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)' } : {}}
                          onMouseEnter={e => { if (value !== iconName) e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'; }}
                          onMouseLeave={e => { if (value !== iconName) e.currentTarget.style.backgroundColor = ''; }}
                          title={iconName}
                        >
                          <IconComponent size={20} />
                          <span className="text-[10px] w-full text-center break-words leading-tight">
                            {iconName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-6 gap-2 ${!searchTerm ? 'mt-3' : ''}`}>
                {filteredIcons
                  .filter(name => searchTerm || !POPULAR_ICONS.includes(name))
                  .map((iconName) => {
                    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<{ size?: number }>;
                    if (!IconComponent) return null;

                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => {
                          onChange(iconName);
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg transition"
                        style={value === iconName ? { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)' } : {}}
                        onMouseEnter={e => { if (value !== iconName) e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'; }}
                        onMouseLeave={e => { if (value !== iconName) e.currentTarget.style.backgroundColor = ''; }}
                        title={iconName}
                      >
                        <IconComponent size={20} />
                        <span className="text-[10px] w-full text-center break-words leading-tight">
                          {iconName}
                        </span>
                      </button>
                    );
                  })}
              </div>

              {filteredIcons.length === 0 && (
                <p className="text-center py-8" style={{ color: 'var(--admin-text-muted)' }}>No icons found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
