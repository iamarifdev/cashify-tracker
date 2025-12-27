import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { useCreateBusiness } from '../api/business.query';
import type { CreateBusinessData } from '../types/business.types';

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100, 'Name too long'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['Retail', 'Service', 'Manufacturing', 'Other'], {
    required_error: 'Business type is required',
  }),
});

interface BusinessFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<CreateBusinessData>;
}

export function BusinessForm({ onSuccess, onCancel, initialData }: BusinessFormProps) {
  const createBusiness = useCreateBusiness();

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category || '',
      type: initialData?.type || 'Retail',
    },
    validators: {
      onChange: zodValidator(),
    },
    onSubmit: async ({ value }) => {
      try {
        await createBusiness.mutateAsync(value as CreateBusinessData);
        form.reset();
        onSuccess?.();
      } catch (error) {
        console.error('Failed to create business:', error);
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
      <div>
        <form.Field
          name="name"
          validators={{
            onChange: businessSchema.shape.name,
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700"
              >
                Business Name
              </label>
              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter business name"
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
          name="category"
          validators={{
            onChange: businessSchema.shape.category,
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., Retail, Food, Technology"
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
          name="type"
          validators={{
            onChange: businessSchema.shape.type,
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700"
              >
                Business Type
              </label>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select type</option>
                <option value="Retail">Retail</option>
                <option value="Service">Service</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
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
              {isSubmitting ? 'Creating...' : 'Create Business'}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}