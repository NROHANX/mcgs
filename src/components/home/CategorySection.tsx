import React from 'react';
import { Category } from '../../types';
import { categories } from '../../data/mockData';
import { Zap, Droplet, PenTool as Tool, Scissors, Palette, Trash, Flower, Tv, Wind } from 'lucide-react';

interface CategorySectionProps {
  onCategoryClick: (categoryId: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ onCategoryClick }) => {
  const getIconForCategory = (iconName: string) => {
    const iconProps = { className: "h-6 w-6 mb-3" };
    switch (iconName) {
      case 'zap': return <Zap {...iconProps} />;
      case 'droplet': return <Droplet {...iconProps} />;
      case 'tool': return <Tool {...iconProps} />;
      case 'scissors': return <Scissors {...iconProps} />;
      case 'palette': return <Palette {...iconProps} />;
      case 'trash': return <Trash {...iconProps} />;
      case 'flower': return <Flower {...iconProps} />;
      case 'tv': return <Wind {...iconProps} />; // Using Wind icon for AC Technician
      default: return <Tool {...iconProps} />;
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Browse by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center transition-all hover:shadow-md hover:-translate-y-1 group"
            >
              <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
                {getIconForCategory(category.icon)}
              </div>
              <h3 className="font-medium text-gray-800">{category.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{category.count} providers</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;