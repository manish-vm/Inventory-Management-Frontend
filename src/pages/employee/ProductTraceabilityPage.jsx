import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inspectionAPI } from '../../api/api';

const ProductTraceabilityPage = ({ admin = false }) => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = admin ? await inspectionAPI.getAdminTraceability(id) : await inspectionAPI.getTraceability(id);
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load traceability');
      }
    };
    load();
  }, [admin, id]);

  if (!data) return <div className="text-slate-500">Loading traceability...</div>;

  const product = data.product || {};
  const primaryQR = data.qrCodes?.[0] || {};
  const timeline = [
    ...(data.scanLogs || []).map((item) => ({ type: 'Scan', time: item.createdAt, title: item.actionTaken, detail: item.stageName, employee: item.employeeName })),
    ...(data.movements || []).map((item) => ({ type: 'Movement', time: item.movedAt, title: item.movementType, detail: `${item.fromStageName} -> ${item.toStageName}`, employee: item.employeeName })),
    ...(data.responses || []).map((item) => ({ type: 'Response', time: item.submittedAt, title: item.inspectionResult, detail: item.formName, employee: item.employeeName }))
  ].sort((a, b) => new Date(a.time) - new Date(b.time));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Traceability</h1>
        <p className="text-slate-600 dark:text-slate-400">Complete product journey, inspection responses, and movement audit.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Product Information</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Code:</span> {product.code || primaryQR.code || id}</p>
            <p><span className="font-medium">Product:</span> {product.productName || '-'}</p>
            <p><span className="font-medium">Description:</span> {product.description || '-'}</p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">QR Information</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">QR Count:</span> {data.qrCodes?.length || 0}</p>
            <p><span className="font-medium">First QR:</span> {primaryQR.qrId || '-'}</p>
            <p><span className="font-medium">Generated:</span> {primaryQR.createdAt ? new Date(primaryQR.createdAt).toLocaleString() : '-'}</p>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Manufacturing Timeline</h2>
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div key={`${item.type}-${index}`} className="grid gap-2 border-l-2 border-primary-200 pl-4 md:grid-cols-[140px_1fr_180px] dark:border-primary-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.time ? new Date(item.time).toLocaleString() : '-'}</p>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.detail}</p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.employee || '-'}</p>
            </div>
          ))}
          {timeline.length === 0 && <p className="text-sm text-slate-500">No timeline records yet.</p>}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Inspection Responses</h2>
        <div className="space-y-4">
          {(data.responses || []).map((response) => (
            <div key={response._id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/60">
              <div className="mb-3 flex flex-wrap justify-between gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">{response.formName}</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{response.inspectionResult}</p>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {(response.responses || []).map((answer) => (
                  <div key={answer.questionId || answer.question} className="rounded-lg bg-white p-3 text-sm dark:bg-slate-800">
                    <p className="font-medium text-slate-700 dark:text-slate-300">{answer.question}</p>
                    <p className="text-slate-900 dark:text-white">{Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductTraceabilityPage;



