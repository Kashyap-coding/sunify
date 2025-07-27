import { SolarInstallation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, MapPin, Circle } from "lucide-react";
import { useState } from "react";

interface SolarDataTableProps {
  installations: SolarInstallation[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function SolarDataTable({ installations, onRefresh, isLoading }: SolarDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(installations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInstallations = installations.slice(startIndex, endIndex);

  const exportData = () => {
    const csvContent = [
      // Header
      ['Location', 'District', 'Annual Money Saved', 'Annual Electricity Saved', 'Solar Energy Usage', 'Surface Area', 'Cost per m²', 'Status'].join(','),
      // Data rows
      ...installations.map(installation => [
        `"${installation.location}"`,
        `"${installation.district}"`,
        installation.annualMoneySaved,
        installation.annualElectricitySaved,
        installation.annualSolarEnergyUsage,
        installation.surfaceArea,
        installation.costPerSquareMeter,
        `"${installation.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solar-installations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string, isOnline: boolean) => {
    if (status === "active" && isOnline) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Circle className="w-3 h-3 text-green-400 mr-1 fill-current" />
          Active
        </Badge>
      );
    } else if (status === "maintenance") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Circle className="w-3 h-3 text-yellow-400 mr-1 fill-current" />
          Maintenance
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <Circle className="w-3 h-3 text-red-400 mr-1 fill-current" />
          Offline
        </Badge>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Solar Installation Data</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="text-xs"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Location</TableHead>
              <TableHead className="text-left">Annual Money Saved</TableHead>
              <TableHead className="text-left">Annual Electricity Saved</TableHead>
              <TableHead className="text-left">Solar Energy Usage</TableHead>
              <TableHead className="text-left">Surface Area</TableHead>
              <TableHead className="text-left">Cost per m²</TableHead>
              <TableHead className="text-left">Total Savings</TableHead>
              <TableHead className="text-left">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentInstallations.map((installation) => (
              <TableRow key={installation.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{installation.district}</div>
                      <div className="text-sm text-gray-500">{installation.location}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-mono text-gray-900">₹{installation.annualMoneySaved.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Annual savings</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-mono text-gray-900">{installation.annualElectricitySaved.toLocaleString()} kWh</div>
                  <div className="text-xs text-gray-500">Energy saved</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-mono text-gray-900">{installation.annualSolarEnergyUsage.toLocaleString()} kWh</div>
                  <div className="text-xs text-gray-500">
                    {Math.round((installation.annualSolarEnergyUsage / installation.annualElectricitySaved) * 100)}% efficiency
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-mono text-gray-900">{installation.surfaceArea} m²</div>
                  <div className="text-xs text-gray-500">Panel area</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-mono text-gray-900">₹{installation.costPerSquareMeter.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Installation cost</div>
                </TableCell>
                <TableCell className="text-green-600 font-medium">
                  ₹{(installation.annualMoneySaved + (installation.annualElectricitySaved * 5)).toLocaleString()}
                </TableCell>
                <TableCell>
                  {getStatusBadge(installation.status, installation.isOnline || false)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, installations.length)}</span> of{' '}
                <span className="font-medium">{installations.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-l-md"
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="rounded-none"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-r-md"
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}