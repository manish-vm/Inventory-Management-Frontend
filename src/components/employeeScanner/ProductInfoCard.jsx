const ProductInfoCard = ({ product }) => {
  if (!product) return null;

  const fields = [
    ['Code', product.code || product.code],
    ['Part Name', product.partDescription || product.description],
    //['Batch Number', product.batchNo],
    // ['Item ID', product.itemId || product.qrId],
    ['Current Stage', product.currentStage || (product.currentStageName ? product.currentStageName : product.currentStageNumber ? `Stage ${product.currentStageNumber}` : '')],
    // ['Next Stage', product.nextStage],
    // ['Current Status', product.manufacturingStatus || product.status],
    ['Created Date', product.createdDate || product.generatedDate ? new Date(product.createdDate || product.generatedDate).toLocaleString() : '-']
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Product Information</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">MES item context for this inspection.</p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {product.manufacturingStatus || 'Pending Inspection'}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 min-h-6 font-medium text-slate-900 dark:text-white">{value || '-'}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductInfoCard;


