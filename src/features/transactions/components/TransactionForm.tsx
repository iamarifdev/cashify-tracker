import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { useCreateTransaction, useUpdateTransaction } from '../api/transaction.query';
import type { CreateTransactionData, Transaction } from '../types/transaction.types';
import { TransactionType } from '@/types';

// Validation schema
const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType, { required_error: 'Transaction type is required' }),
  date: z.string().min(1, 'Date is required'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  details: z.string().min(1, 'Details are required').max(500, 'Details too long'),
  category: z.string().min(1, 'Category is required'),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  contactName: z.string().optional(),
});

const categories = [
  'Sales',
  'Service Income',
  'Rent Received',
  'Interest Income',
  'Other Income',
  'Purchases',
  'Salaries',
  'Rent',
  'Utilities',
  'Marketing',
  'Office Supplies',
  'Transportation',
  'Repairs & Maintenance',
  'Other Expenses',
];

const paymentModes = [
  'Cash',
  'Bank Transfer',
  'Cheque',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Other',
];

interface TransactionFormProps {
  bookId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<Transaction>;
}

export function TransactionForm({ bookId, onSuccess, onCancel, initialData }: TransactionFormProps) {
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const isEditing = !!initialData?.id;

  const form = useForm({
    defaultValues: {
      type: initialData?.type || TransactionType.CASH_IN,
      date: initialData?.date || new Date().toISOString().split('T')[0],
      time: initialData?.time || new Date().toTimeString().slice(0, 5),
      amount: initialData?.amount || 0,
      details: initialData?.details || '',
      category: initialData?.category || '',
      paymentMode: initialData?.paymentMode || 'Cash',
      contactName: initialData?.contactName || '',
    },
    validators: {
      onChange: zodValidator(),
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing && initialData?.id) {
          await updateTransaction.mutateAsync({
            id: initialData.id,
            bookId,
            ...value,
          });
        } else {
          await createTransaction.mutateAsync({
            bookId,
            ...value,
          });
        }
        form.reset();
        onSuccess?.();
      } catch (error) {
        console.error('Failed to save transaction:', error);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <form.Field
            name="type"
            validators={{
              onChange: transactionSchema.shape.type,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  Transaction Type *
                </label>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as TransactionType)}
                  onBlur={field.handleBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value={TransactionType.CASH_IN}>Cash In</option>
                  <option value={TransactionType.CASH_OUT}>Cash Out</option>
                </select>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    {field.state.meta.errors[0]?.toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field
            name="amount"
            validators={{
              onChange: transactionSchema.shape.amount,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount *
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                  onBlur={field.handleBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    {field.state.meta.errors[0]?.toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <form.Field
            name="date"
            validators={{
              onChange: transactionSchema.shape.date,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  Date *
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    {field.state.meta.errors[0]?.toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field
            name="time"
            validators={{
              onChange: transactionSchema.shape.time,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  Time *
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="time"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    {field.state.meta.errors[0]?.toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>
      </div>

      <div>
        <form.Field
          name="details"
          validators={{
            onChange: transactionSchema.shape.details,
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700"
              >
                Details *
              </label>
              <textarea
                id={field.name}
                name={field.name}
                rows={3}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter transaction details"
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                <p className="mt-2 text-sm text-red-600">
                  {field.state.meta.errors[0]?.toString()}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <form.Field
            name="category"
            validators={{
              onChange: transactionSchema.shape.category,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  Category *
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  list="categories"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Select or enter category"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    {field.state.meta.errors[0]?.toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field
            name="paymentMode"
            validators={{
              onChange: transactionSchema.shape.paymentMode,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  Payment Mode *
                </label>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select payment mode</option>
                  {paymentModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    {field.state.meta.errors[0]?.toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>
      </div>

      <div>
        <form.Field name="contactName">
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700"
              >
                Contact Name (Optional)
              </label>
              <input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Customer or supplier name"
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Transaction' : 'Create Transaction')}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}