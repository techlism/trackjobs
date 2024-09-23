import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TabProps = {
  tabs: string[];
  children: React.ReactNode[];
};

export const Tab: React.FC<TabProps> = ({ tabs, children }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Tabs value={activeTab.toString()} onValueChange={(value) => setActiveTab(Number(value))}>
      <TabsList>
        {tabs.map((tab, index) => (
          <TabsTrigger key={index} value={index.toString()}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {children.map((child, index) => (
        <TabsContent key={index} value={index.toString()}>
          {child}
        </TabsContent>
      ))}
    </Tabs>
  );
};