// components/layout/Layout.tsx
"use client";

//import Header from '../header/Header';
import Footer from '../footer/Footer';

interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, pageTitle = 'Fisher' }) => {
  return (
    <div className="min-h-screen flex flex-col">
     
      <main className="flex-grow pt-16"> {/* 16 = 4rem = height of your header */}
        {children}
      </main>
     
    </div>
  );
};

export default Layout;