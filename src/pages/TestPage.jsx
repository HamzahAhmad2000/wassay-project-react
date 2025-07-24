const TestPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        🎉 Test Page Working!
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        If you can see this page, then:
      </p>
      <ul className="list-disc list-inside space-y-2 text-gray-600">
        <li>React is rendering properly</li>
        <li>Router is working</li>
        <li>Tailwind CSS is loaded</li>
        <li>Components are functioning</li>
      </ul>
      <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Next Steps:</h2>
        <p className="text-blue-700">
          Now we can gradually re-enable the authentication and other components 
          to identify what was causing the blank screen issue.
        </p>
      </div>
    </div>
  );
};

export default TestPage; 