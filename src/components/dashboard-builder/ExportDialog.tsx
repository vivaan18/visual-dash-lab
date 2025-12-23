
// import React, { useState } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { toast } from "@/hooks/use-toast";
// import { Download, Share, Link, Image as ImageIcon } from 'lucide-react';
// import type { DashboardComponent } from '@/types/dashboard';

// interface ExportDialogProps {
//   components: DashboardComponent[];
//   canvasRef: React.RefObject<HTMLDivElement>;
//   onClose: () => void;
// }

// const ExportDialog: React.FC<ExportDialogProps> = ({
//   components,
//   canvasRef,
//   onClose
// }) => {
//   const [exportFormat, setExportFormat] = useState('png');
//   const [isExporting, setIsExporting] = useState(false);

//   const handleExport = async () => {
//     setIsExporting(true);
    
//     try {
//       switch (exportFormat) {
//         case 'png':
//           await exportAsPNG();
//           break;
//         case 'pdf':
//           await exportAsPDF();
//           break;
//         case 'json':
//           exportAsJSON();
//           break;
//         case 'link':
//           generateShareableLink();
//           break;
//         default:
//           break;
//       }
//     } catch (error) {
//       toast({
//         title: "Export Failed",
//         description: "There was an error exporting your dashboard.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const exportAsPNG = async () => {
//     // Placeholder - will be implemented after resolving build issues
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     toast({
//       title: "PNG Export Complete",
//       description: "Your dashboard has been exported as a PNG image.",
//     });
    
//     onClose();
//   };

//   const exportAsPDF = async () => {
//     // Placeholder - will be implemented after resolving build issues  
//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     toast({
//       title: "PDF Export Complete",
//       description: "Your dashboard has been exported as a PDF document.",
//     });
    
//     onClose();
//   };

//   const exportAsJSON = () => {
//     const exportData = {
//       version: '1.0',
//       components,
//       exportedAt: new Date().toISOString(),
//     };
    
//     const blob = new Blob([JSON.stringify(exportData, null, 2)], {
//       type: 'application/json'
//     });
    
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'dashboard-mockup.json';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
    
//     toast({
//       title: "JSON Export Complete",
//       description: "Your dashboard configuration has been downloaded.",
//     });
    
//     onClose();
//   };

//   const generateShareableLink = () => {
//     // For demo purposes, we'll generate a mock shareable link
//     const mockUrl = `https://dashboard-builder.app/shared/${Math.random().toString(36).substring(7)}`;
    
//     navigator.clipboard.writeText(mockUrl).then(() => {
//       toast({
//         title: "Link Copied",
//         description: "Shareable link has been copied to your clipboard.",
//       });
//     });
    
//     onClose();
//   };

//   return (
//     <Dialog open={true} onOpenChange={onClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Export Dashboard</DialogTitle>
//         </DialogHeader>
        
//         <div className="space-y-4">
//           <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
//             <Card className="p-3">
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="png" id="png" />
//                 <Label htmlFor="png" className="flex items-center space-x-2 cursor-pointer">
//                   <ImageIcon className="h-4 w-4" />
//                   <span>PNG Image</span>
//                 </Label>
//               </div>
//               <p className="text-sm text-gray-500 ml-6 mt-1">
//                 High-quality image for presentations
//               </p>
//             </Card>
            
//             <Card className="p-3">
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="pdf" id="pdf" />
//                 <Label htmlFor="pdf" className="flex items-center space-x-2 cursor-pointer">
//                   <Download className="h-4 w-4" />
//                   <span>PDF Document</span>
//                 </Label>
//               </div>
//               <p className="text-sm text-gray-500 ml-6 mt-1">
//                 Print-ready document format
//               </p>
//             </Card>
            
//             <Card className="p-3">
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="json" id="json" />
//                 <Label htmlFor="json" className="flex items-center space-x-2 cursor-pointer">
//                   <Download className="h-4 w-4" />
//                   <span>JSON Configuration</span>
//                 </Label>
//               </div>
//               <p className="text-sm text-gray-500 ml-6 mt-1">
//                 Save your dashboard layout for later
//               </p>
//             </Card>
            
//             <Card className="p-3">
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="link" id="link" />
//                 <Label htmlFor="link" className="flex items-center space-x-2 cursor-pointer">
//                   <Link className="h-4 w-4" />
//                   <span>Shareable Link</span>
//                 </Label>
//               </div>
//               <p className="text-sm text-gray-500 ml-6 mt-1">
//                 Generate a link to share your dashboard
//               </p>
//             </Card>
//           </RadioGroup>
//         </div>
        
//         <div className="flex space-x-2 pt-4">
//           <Button variant="outline" onClick={onClose} className="flex-1">
//             Cancel
//           </Button>
//           <Button onClick={handleExport} disabled={isExporting} className="flex-1">
//             {isExporting ? 'Exporting...' : 'Export'}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ExportDialog;



import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

interface ExportDialogProps {
  components: any[];
  canvasRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ components, canvasRef, onClose }) => {
  // 🖼 PNG Export
  const handleExportPNG = async () => {
    if (!canvasRef.current) {
      toast({
        title: "Export failed",
        description: "Dashboard canvas not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `dashboard-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Export Successful",
        description: "Your dashboard was downloaded as a PNG.",
      });
      onClose();
    } catch (error) {
      console.error("PNG export error:", error);
      toast({
        title: "Export failed",
        description: "There was an issue generating the PNG file.",
        variant: "destructive",
      });
    }
  };

  // 📄 PDF Export
  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      const pdf = new jsPDF("l", "pt", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`dashboard-${Date.now()}.pdf`);

      toast({
        title: "PDF Exported",
        description: "Dashboard exported as PDF.",
      });
      onClose();
    } catch (err) {
      console.error("PDF export error:", err);
      toast({
        title: "Export failed",
        description: "Could not generate PDF.",
        variant: "destructive",
      });
    }
  };

  // 🧩 JSON Export
  const handleExportJSON = () => {
    try {
      const json = JSON.stringify(components, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dashboard-${Date.now()}.json`;
      link.click();

      toast({
        title: "Export Successful",
        description: "Dashboard exported as JSON file.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate JSON file.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Dashboard</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 mt-2">
          <Button onClick={handleExportPNG}>Export as PNG</Button>
          <Button onClick={handleExportPDF} variant="outline">Export as PDF</Button>
          <Button onClick={handleExportJSON} variant="outline">Export as JSON</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
