import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SimpleBarChart, SimplePieChart, SimpleLineChart, SimpleMultiLineChart } from './ChartComponents';
import { reportOptions, reportConfig } from './ReportOptions';
import { apiReport } from '../APIs/ReportsAPIs';

const ReportTemplate = () => {
  const reportRef = useRef(null);
  const [selectedReport, setSelectedReport] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartDataKey, setChartDataKey] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Get report configuration
  const config = reportConfig[selectedReport] || {};

  // Normalize data based on report configuration
  const normalizeData = (data) => {
    if (!config.normalize) return [{ id: 1, value: 'No data' }];
    return config.normalize(data).map((item, index) => ({
      id: index + 1,
      ...item,
    }));
  };

  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      if (selectedReport) {
        setLoading(true);
        try {
          const data = await apiReport(selectedReport);
          const normalizedData = normalizeData(data);
          setReportData(normalizedData);
          if (!chartDataKey && config.chartDataKeys?.length > 0) {
            setChartDataKey(config.chartDataKeys[0].value);
          }
        } catch (error) {
          console.error(`Error fetching ${selectedReport} report:`, error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchReport();
  }, [selectedReport, config]);

  // Generate PDF
  const generatePDF = () => {
    setIsGeneratingPDF(true);
    const input = reportRef.current;
    // Temporarily hide dropdowns and button
    const controls = input.querySelectorAll('.report-controls');
    const downloadBtn = input.querySelector('.download-btn');
    controls.forEach(control => (control.style.display = 'none'));
    if (downloadBtn) downloadBtn.style.display = 'none';

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`corporate_report_${selectedReport.replace('/', '_')}.pdf`);

      // Restore visibility
      controls.forEach(control => (control.style.display = 'block'));
      if (downloadBtn) downloadBtn.style.display = 'block';
      setIsGeneratingPDF(false);
    });
  };

  // Dynamically determine table keys
  const tableKeys = config.tableKeys || Object.keys(reportData[0] || {}).filter(key => key !== 'id');

  // Render chart based on selected chart type
  const renderChart = () => {
    if (!config.chartConfig || !reportData.length) return null;

    const { xAxisKey = 'name', multiLineKeys = [], multiLineNames = [] } = config.chartConfig;

    switch (chartType) {
      case 'bar':
        return (
          <SimpleBarChart
            data={reportData}
            dataKey={chartDataKey}
            xAxisKey={xAxisKey}
            chartName={config.chartDataKeys.find(key => key.value === chartDataKey)?.label || chartDataKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            width={600}
            height={300}
          />
        );
      case 'pie':
        return (
          <SimplePieChart
            data={reportData}
            dataKey={chartDataKey}
            nameKey={xAxisKey}
            width={600}
            height={300}
          />
        );
      case 'line':
        return (
          <SimpleLineChart
            data={reportData}
            dataKey={chartDataKey}
            xAxisKey={xAxisKey}
            chartName={config.chartDataKeys.find(key => key.value === chartDataKey)?.label || chartDataKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            width={600}
            height={300}
          />
        );
      case 'multiline':
        return (
          <SimpleMultiLineChart
            data={reportData}
            dataKeys={multiLineKeys}
            xAxisKey={xAxisKey}
            chartNames={multiLineNames}
            width={600}
            height={300}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-[#1a202c] font-sans">
      <div ref={reportRef} className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center mb-8 pb-6 border-b-2 border-[#e2e8f0]">
          <div className="w-20 h-20 bg-[#a0b5eb] rounded-full mr-6 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#2d3748]">AC</span>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-[#2d3748]">Acme Corporation</h1>
            <p className="text-[#718096] text-sm mt-1">123 Business Street, Suite 100, Cityville, ST 12345, USA</p>
          </div>
        </div>

        {/* Report Metadata */}
        <div className="mb-8 text-[#718096]">
          <p className="text-sm">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Karachi' })}</p>
          <p className="text-sm">Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' })}</p>
          {selectedReport && (
            <>
              <p className="text-sm mt-2">Report: {reportOptions.find(opt => opt.value === selectedReport)?.name || 'Report'}</p>
              {chartType && <p className="text-sm">Chart Type: {config.chartTypes?.find(type => type.value === chartType)?.label || 'None'}</p>}
            </>
          )}
        </div>

        {/* Dropdown Controls */}
        <div className="report-controls mb-8 space-y-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="reportSelect" className="text-[#2d3748] font-medium">Select Report:</label>
            <select
              id="reportSelect"
              value={selectedReport}
              onChange={(e) => {
                setSelectedReport(e.target.value);
                setChartDataKey('');
              }}
              className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f7fafc] focus:ring-2 focus:ring-[#4a90e2] focus:border-[#4a90e2] transition-colors"
            >
              <option value="">-- Select a Report --</option>
              {reportOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          {selectedReport && config.chartDataKeys?.length > 0 && (
            <>
              <div className="flex items-center space-x-4">
                <label htmlFor="chartDataSelect" className="text-[#2d3748] font-medium">Chart Data:</label>
                <select
                  id="chartDataSelect"
                  value={chartDataKey}
                  onChange={(e) => setChartDataKey(e.target.value)}
                  className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f7fafc] focus:ring-2 focus:ring-[#4a90e2] focus:border-[#4a90e2] transition-colors"
                >
                  {config.chartDataKeys.map((key) => (
                    <option key={key.value} value={key.value}>
                      {key.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <label htmlFor="chartTypeSelect" className="text-[#2d3748] font-medium">Chart Type:</label>
                <select
                  id="chartTypeSelect"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f7fafc] focus:ring-2 focus:ring-[#4a90e2] focus:border-[#4a90e2] transition-colors"
                >
                  <option value="">None</option>
                  {config.chartTypes?.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Loading State */}
        {loading && <p className="text-[#4a90e2] text-lg font-medium">Loading report...</p>}

        {/* Report Title and Content */}
        {selectedReport && !loading && reportData.length > 0 && (
          <>
            <h2 className="text-3xl font-semibold text-[#2d3748] mb-6 pb-3 border-b-2 border-[#e2e8f0]">
              {reportOptions.find(opt => opt.value === selectedReport)?.name || 'Report'}
            </h2>
            {chartType && (
              <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-[#e2e8f0]">
                {renderChart()}
              </div>
            )}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                <thead>
                  <tr className="bg-[#e6efff] text-[#2d3748]">
                    {tableKeys.map((key) => (
                      <th key={key} className="border-b border-[#e2e8f0] p-4 text-left font-semibold text-sm">
                        {(config.displayNames?.[key] || key).replace('__', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr key={index} className="hover:bg-[#f7fafc] transition-colors">
                      {tableKeys.map((key) => (
                        <td key={key} className="border-b border-[#e2e8f0] p-4 text-sm">
                          {typeof row[key] === 'number' ? row[key].toFixed(2) : row[key] || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={generatePDF}
              className="download-btn bg-[#2d3748] text-white px-8 py-3 rounded-lg hover:bg-[#1a202c] transition-colors disabled:bg-[#a0aec0] disabled:cursor-not-allowed"
              disabled={!selectedReport || loading || isGeneratingPDF}
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </>
        )}
        {!loading && reportData.length === 0 && selectedReport && <p className="text-[#e53e3e] text-lg font-medium">No data available for this report.</p>}
      </div>
    </div>
  );
};

export default ReportTemplate;