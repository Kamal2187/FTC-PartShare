import React, { createContext, useContext, useState, useEffect } from 'react';
import { partsUpdater } from '../services/partsUpdater';

interface Part {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  specifications: {
    attribute: string;
    values: string[];
  }[];
  imageUrl: string;
  modelUrl?: string;
}

interface PartsContextType {
  parts: Part[];
  searchParts: (query: string) => Part[];
  getPartBySKU: (sku: string) => Part | undefined;
  getPartsByCategory: (category: string) => Part[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  refreshParts: () => Promise<void>;
  forceUpdate: () => Promise<{ added: number; updated: number; errors: string[] }>;
  updateStatus: {
    lastUpdate: string | null;
    totalParts: number;
    nextUpdateDue: string;
  };
}

const PartsContext = createContext<PartsContextType | undefined>(undefined);

// Comprehensive GoBilda parts database
const sampleParts: Part[] = [
  // Motion - Motors and Servos
  {
    id: '1',
    sku: '5202-0002-0012',
    name: 'Yellow Jacket Motor (5.2:1)',
    category: 'Motion',
    description: '12V DC motor with integrated 5.2:1 planetary gearbox. Features a 6mm D-shaft output and mounting points compatible with goBILDA pattern.',
    specifications: [
      { attribute: 'Voltage', values: ['12V DC'] },
      { attribute: 'Gear Ratio', values: ['5.2:1'] },
      { attribute: 'Output Shaft', values: ['6mm D-Shaft'] },
      { attribute: 'Stall Torque', values: ['4.4 N⋅m'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5901_zoom.jpeg'
  },
  {
    id: '2',
    sku: '5202-0002-0019',
    name: 'Yellow Jacket Motor (19.2:1)',
    category: 'Motion',
    description: '12V DC motor with integrated 19.2:1 planetary gearbox. Higher torque version ideal for lifts and heavy loads.',
    specifications: [
      { attribute: 'Voltage', values: ['12V DC'] },
      { attribute: 'Gear Ratio', values: ['19.2:1'] },
      { attribute: 'Output Shaft', values: ['6mm D-Shaft'] },
      { attribute: 'Stall Torque', values: ['8.4 N⋅m'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5902_zoom.jpeg'
  },
  {
    id: '3',
    sku: '5202-0002-0139',
    name: 'Yellow Jacket Motor (139.5:1)',
    category: 'Motion',
    description: 'High torque motor with 139.5:1 gear ratio. Perfect for heavy lifting applications and slow, controlled movements.',
    specifications: [
      { attribute: 'Voltage', values: ['12V DC'] },
      { attribute: 'Gear Ratio', values: ['139.5:1'] },
      { attribute: 'Output Shaft', values: ['6mm D-Shaft'] },
      { attribute: 'Stall Torque', values: ['13.6 N⋅m'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5903_zoom.jpeg'
  },

  // Motion - Wheels
  {
    id: '4',
    sku: '3601-0024-0001',
    name: 'Mecanum Wheel (96mm)',
    category: 'Motion',
    description: '96mm Mecanum wheel with 24 rollers. Enables holonomic movement when used in a set of four.',
    specifications: [
      { attribute: 'Diameter', values: ['96mm'] },
      { attribute: 'Roller Material', values: ['TPU'] },
      { attribute: 'Hub Material', values: ['Aluminum'] },
      { attribute: 'Bore Size', values: ['6mm'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5905_zoom.jpeg'
  },
  {
    id: '5',
    sku: '3304-0096-0001',
    name: 'Traction Wheel (96mm)',
    category: 'Motion',
    description: '96mm rubber traction wheel. High grip surface for reliable movement.',
    specifications: [
      { attribute: 'Diameter', values: ['96mm'] },
      { attribute: 'Material', values: ['Rubber Tire', 'Aluminum Hub'] },
      { attribute: 'Bore Size', values: ['6mm'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5906_zoom.jpeg'
  },

  // Structure - Channels
  {
    id: '6',
    sku: '1120-0016-0500',
    name: 'U-Channel (500mm)',
    category: 'Structure',
    description: 'Versatile aluminum U-channel with goBILDA pattern. Perfect for creating strong structural elements.',
    specifications: [
      { attribute: 'Length', values: ['500mm'] },
      { attribute: 'Material', values: ['Anodized Aluminum'] },
      { attribute: 'Pattern', values: ['16mm goBILDA'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5904_zoom.jpeg'
  },
  {
    id: '7',
    sku: '1121-0016-0250',
    name: 'Low-Side U-Channel (250mm)',
    category: 'Structure',
    description: 'Low-profile U-channel for space-constrained applications.',
    specifications: [
      { attribute: 'Length', values: ['250mm'] },
      { attribute: 'Material', values: ['Anodized Aluminum'] },
      { attribute: 'Pattern', values: ['16mm goBILDA'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5907_zoom.jpeg'
  },

  // Motion - Bearings and Mounts
  {
    id: '8',
    sku: '1614-0016-0006',
    name: 'Dual-Bearing Pillow Block',
    category: 'Motion',
    description: 'This pillow block is an all-in-one solution to provide support to a 6mm diameter round shaft or 6mm diameter D-shaft.',
    specifications: [
      { attribute: 'Bore Size', values: ['6mm'] },
      { attribute: 'Material', values: ['Aluminum Housing', 'High-Carbon Steel Bearings'] },
      { attribute: 'Weight', values: ['23g'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5873_zoom.jpeg'
  },
  {
    id: '9',
    sku: '1610-0006-0001',
    name: 'Ball Bearing (6mm)',
    category: 'Motion',
    description: 'High-quality ball bearing for 6mm shafts. Low friction and long life.',
    specifications: [
      { attribute: 'Inner Diameter', values: ['6mm'] },
      { attribute: 'Outer Diameter', values: ['12mm'] },
      { attribute: 'Type', values: ['Sealed Ball Bearing'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5908_zoom.jpeg'
  },

  // Motion - Shafts
  {
    id: '10',
    sku: '3102-0006-0048',
    name: 'Stainless Steel D-Shaft (48mm)',
    category: 'Motion',
    description: 'High-precision 6mm D-shaft made from hardened stainless steel.',
    specifications: [
      { attribute: 'Diameter', values: ['6mm'] },
      { attribute: 'Length', values: ['48mm'] },
      { attribute: 'Material', values: ['Hardened Stainless Steel'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5909_zoom.jpeg'
  },
  {
    id: '11',
    sku: '3101-0006-0250',
    name: 'Round Shaft (250mm)',
    category: 'Motion',
    description: '6mm round shaft for general motion transfer applications.',
    specifications: [
      { attribute: 'Diameter', values: ['6mm'] },
      { attribute: 'Length', values: ['250mm'] },
      { attribute: 'Material', values: ['Stainless Steel'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5910_zoom.jpeg'
  },

  // Structure - Plates and Brackets
  {
    id: '12',
    sku: '1501-0016-0048',
    name: 'Pattern Plate (48mm)',
    category: 'Structure',
    description: 'Square pattern plate with goBILDA hole pattern.',
    specifications: [
      { attribute: 'Dimensions', values: ['48mm x 48mm'] },
      { attribute: 'Material', values: ['Anodized Aluminum'] },
      { attribute: 'Pattern', values: ['16mm goBILDA'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5911_zoom.jpeg'
  },
  {
    id: '13',
    sku: '1401-0002-0032',
    name: 'Inside Corner Bracket',
    category: 'Structure',
    description: 'L-shaped bracket for creating 90-degree connections.',
    specifications: [
      { attribute: 'Material', values: ['Anodized Aluminum'] },
      { attribute: 'Pattern', values: ['16mm goBILDA'] },
      { attribute: 'Angle', values: ['90 degrees'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5912_zoom.jpeg'
  },

  // Motion - Hubs and Couplers
  {
    id: '14',
    sku: '2910-0808-0006',
    name: 'Clamping Hub',
    category: 'Motion',
    description: 'Aluminum clamping hub for 6mm shafts with two clamping screws.',
    specifications: [
      { attribute: 'Bore Size', values: ['6mm'] },
      { attribute: 'Material', values: ['Aluminum'] },
      { attribute: 'Mounting Pattern', values: ['8mm Pitch Circle'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5913_zoom.jpeg'
  },
  {
    id: '15',
    sku: '2919-0006-0015',
    name: 'Shaft Coupler',
    category: 'Motion',
    description: 'Flexible shaft coupler for connecting 6mm shafts. Compensates for minor misalignment.',
    specifications: [
      { attribute: 'Bore Size', values: ['6mm to 6mm'] },
      { attribute: 'Material', values: ['Aluminum', 'TPU Insert'] },
      { attribute: 'Length', values: ['25mm'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5914_zoom.jpeg'
  },

  // Hardware
  {
    id: '16',
    sku: '2101-0004-0016',
    name: 'Socket Head Screw',
    category: 'Hardware',
    description: 'M4 socket head cap screw. Standard fastener for goBILDA pattern.',
    specifications: [
      { attribute: 'Size', values: ['M4'] },
      { attribute: 'Length', values: ['16mm'] },
      { attribute: 'Head Type', values: ['Socket Head'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5915_zoom.jpeg'
  },
  {
    id: '17',
    sku: '2302-0004-0001',
    name: 'Nyloc Nut',
    category: 'Hardware',
    description: 'M4 nylon insert lock nut. Prevents loosening under vibration.',
    specifications: [
      { attribute: 'Size', values: ['M4'] },
      { attribute: 'Type', values: ['Nylon Insert Lock'] },
      { attribute: 'Material', values: ['Steel', 'Nylon Insert'] }
    ],
    imageUrl: 'https://www.gobilda.com/content/images/thumbs/default/zoom/5916_zoom.jpeg'
  }
];

export function PartsProvider({ children }: { children: React.ReactNode }) {
  const [parts, setParts] = useState<Part[]>(sampleParts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load parts from localStorage on mount
  useEffect(() => {
    const loadParts = async () => {
      setIsLoading(true);
      try {
        // Try to load from localStorage first
        const storedParts = localStorage.getItem('gobilda_parts');
        if (storedParts) {
          const parsedParts = JSON.parse(storedParts);
          setParts([...sampleParts, ...parsedParts]); // Merge with sample data
        }

        // Check if update is needed
        if (partsUpdater.shouldUpdate()) {
          console.log('Parts update needed, starting background update...');
          partsUpdater.updatePartsDatabase().then(result => {
            if (result.added > 0 || result.updated > 0) {
              // Reload parts after update
              refreshParts();
            }
          }).catch(err => {
            console.warn('Background parts update failed:', err);
          });
        }
      } catch (err) {
        setError('Failed to load parts data');
        console.error('Error loading parts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadParts();
  }, []);

  const refreshParts = async () => {
    try {
      const storedParts = localStorage.getItem('gobilda_parts');
      if (storedParts) {
        const parsedParts = JSON.parse(storedParts);
        setParts([...sampleParts, ...parsedParts]);
      }
    } catch (err) {
      setError('Failed to refresh parts data');
      console.error('Error refreshing parts:', err);
    }
  };

  const forceUpdate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await partsUpdater.forceUpdate();
      
      if (result.errors.length > 0) {
        setError(`Update completed with ${result.errors.length} errors`);
        console.warn('Update errors:', result.errors);
      }
      
      // Refresh parts after update
      await refreshParts();
      
      return result;
    } catch (err) {
      const errorMsg = 'Failed to update parts database';
      setError(errorMsg);
      console.error('Force update error:', err);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const searchParts = (query: string): Part[] => {
    const lowercaseQuery = query.toLowerCase();
    return parts.filter(
      part =>
        part.name.toLowerCase().includes(lowercaseQuery) ||
        part.sku.toLowerCase().includes(lowercaseQuery) ||
        part.description.toLowerCase().includes(lowercaseQuery) ||
        part.category.toLowerCase().includes(lowercaseQuery) ||
        part.specifications.some(spec =>
          spec.values.some(value => value.toLowerCase().includes(lowercaseQuery))
        )
    );
  };

  const getPartBySKU = (sku: string): Part | undefined => {
    return parts.find(part => part.sku === sku);
  };

  const getPartsByCategory = (category: string): Part[] => {
    return parts.filter(part => part.category === category);
  };

  const categories = Array.from(new Set(parts.map(part => part.category)));

  const updateStatus = partsUpdater.getUpdateStatus();

  const value = {
    parts,
    searchParts,
    getPartBySKU,
    getPartsByCategory,
    categories,
    isLoading,
    error,
    refreshParts,
    forceUpdate,
    updateStatus
  };

  return <PartsContext.Provider value={value}>{children}</PartsContext.Provider>;
}

export function useParts() {
  const context = useContext(PartsContext);
  if (context === undefined) {
    throw new Error('useParts must be used within a PartsProvider');
  }
  return context;
} 