import type { LucideIcon } from "lucide-react";

export interface NavTab {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  accentColor: string;
  tabs: NavTab[];
}

export function BottomNavigation({ activeTab, onTabChange, accentColor, tabs }: BottomNavigationProps) {
  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`p-4 text-xs text-center transition-colors ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? accentColor : 'transparent'
                }}
                aria-label={tab.label}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <tab.icon className="w-5 h-5 mx-auto mb-1" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom padding for fixed nav */}
      <div className="h-20" aria-hidden="true"></div>
    </>
  );
}
