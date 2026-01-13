import * as React from "react";
import * as yup from "yup";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { MP_DIALOG } from "@/components/ui/DialogTheme";

const UNIT_OPTIONS = ["kg", "g", "L", "ml", "pcs"];

/* ---------------- helpers ---------------- */
const pickEditable = (listing) => ({
  title: listing?.title ?? "",
  description: listing?.description ?? "",
  price: listing?.price ?? "",
  currency: listing?.currency ?? "EGP",
  quantity: listing?.quantity ?? "",
  unit: listing?.unit ?? "kg",
  available_until: listing?.available_until?.split("T")[0] ?? "",
  featured_image: null,
});

/* ---------------- yup schema ---------------- */
const schema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),

  description: yup
    .string()
    .trim()
    .max(2000, "Description must be less than 2000 characters")
    .nullable()
    .transform((value) => value || null),

  price: yup
    .number()
    .typeError("Price must be a valid number")
    .required("Price is required")
    .positive("Price must be greater than 0")
    .max(1000000, "Price must be less than 1,000,000"),

  currency: yup
    .string()
    .trim()
    .required("Currency is required")
    .matches(/^[A-Z]{3}$/, "Currency must be 3 letters (e.g., EGP, USD)"),

  quantity: yup
    .number()
    .typeError("Quantity must be a valid number")
    .required("Quantity is required")
    .positive("Quantity must be greater than 0")
    .max(1000000, "Quantity must be less than 1,000,000"),

  unit: yup
    .string()
    .oneOf(UNIT_OPTIONS, "Invalid unit")
    .required("Unit is required"),

  available_until: yup
    .date()
    .typeError("Invalid date format")
    .required("Available until date is required")
    .min(new Date(), "Date must be in the future"),

  featured_image: yup
    .mixed()
    .nullable()
    .test(
      "fileType",
      "Only image files (JPG, PNG, GIF, WEBP) are allowed",
      (file) => {
        if (!file) return true;
        if (!(file instanceof File)) return false;
        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        return validTypes.includes(file.type);
      }
    )
    .test("fileSize", "Image must be less than 5MB", (file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024; // 5MB
    }),
});

const EditListingDialog = ({ open, onOpenChange, listing, onSubmit }) => {
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState(() => pickEditable(listing));
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (listing?.id) {
      setForm(pickEditable(listing));
      setErrors({});
    }
  }, [listing?.id, open]);

  const setField = (key) => (e) => {
    setForm((p) => ({
      ...p,
      [key]: e.target.value,
    }));
    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0] ?? null;
    setForm((p) => ({ ...p, featured_image: file }));
    // Clear error when file is selected
    if (errors.featured_image) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.featured_image;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!listing?.id) return;

    setSubmitting(true);

    try {
      // Validate form data
      await schema.validate(form, { abortEarly: false });
      setErrors({});

      // Prepare payload
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        price: Number(form.price),
        currency: form.currency.trim().toUpperCase(),
        quantity: Number(form.quantity),
        unit: form.unit,
        available_until: form.available_until,
      };

      // Only include featured_image if a new file was selected
      if (form.featured_image && form.featured_image instanceof File) {
        payload.featured_image = form.featured_image;
      }

      await onSubmit?.(listing.id, payload);

      // Reset form and close dialog on success
      setForm(pickEditable(null));
      setErrors({});
      onOpenChange?.(false);
    } catch (err) {
      if (err.name === "ValidationError") {
        // Handle Yup validation errors
        const fieldErrors = {};
        err.inner.forEach((e) => {
          if (e.path && !fieldErrors[e.path]) {
            fieldErrors[e.path] = e.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Handle other errors (API errors, etc.)
        console.error("Submit error:", err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm(pickEditable(listing));
    setErrors({});
    onOpenChange?.(false);
  };

  if (!listing) return null;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MP_DIALOG.content}>
        <DialogHeader>
          <DialogTitle className={MP_DIALOG.title}>Edit Listing</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Error summary */}
          {hasErrors && (
            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 animate-shake">
              <p className="text-sm font-semibold text-red-700 mb-2">
                ⚠️ Please fix the following errors:
              </p>
              <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
                {Object.entries(errors).map(([field, msg]) => (
                  <li key={field}>
                    <span className="font-medium capitalize">
                      {field.replace("_", " ")}:
                    </span>{" "}
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              className={`${MP_DIALOG.input} ${
                errors.title ? "border-red-500 focus:ring-red-500" : ""
              }`}
              placeholder="e.g., Fresh Organic Tomatoes"
              value={form.title}
              onChange={setField("title")}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              className={`${MP_DIALOG.input} ${
                errors.description ? "border-red-500 focus:ring-red-500" : ""
              }`}
              placeholder="Describe your product..."
              value={form.description}
              onChange={setField("description")}
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <Input
                className={`${MP_DIALOG.input} ${
                  errors.price ? "border-red-500 focus:ring-red-500" : ""
                }`}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={setField("price")}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency <span className="text-red-500">*</span>
              </label>
              <Input
                className={`${MP_DIALOG.input} ${
                  errors.currency ? "border-red-500 focus:ring-red-500" : ""
                }`}
                type="text"
                placeholder="EGP"
                value={form.currency}
                onChange={setField("currency")}
                maxLength={3}
              />
              {errors.currency && (
                <p className="mt-1 text-sm text-red-500">{errors.currency}</p>
              )}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                className={`${MP_DIALOG.input} ${
                  errors.quantity ? "border-red-500 focus:ring-red-500" : ""
                }`}
                type="number"
                placeholder="0"
                value={form.quantity}
                onChange={setField("quantity")}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.unit}
                onValueChange={(value) => {
                  setForm((p) => ({ ...p, unit: value }));
                  if (errors.unit) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.unit;
                      return newErrors;
                    });
                  }
                }}
              >
                <SelectTrigger
                  className={`${MP_DIALOG.selectTrigger} ${
                    errors.unit ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className={MP_DIALOG.selectContent}>
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="mt-1 text-sm text-red-500">{errors.unit}</p>
              )}
            </div>
          </div>

          {/* Available Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Until <span className="text-red-500">*</span>
            </label>
            <Input
              className={`${MP_DIALOG.input} ${
                errors.available_until
                  ? "border-red-500 focus:ring-red-500"
                  : ""
              }`}
              type="date"
              value={form.available_until}
              onChange={setField("available_until")}
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.available_until && (
              <p className="mt-1 text-sm text-red-500">
                {errors.available_until}
              </p>
            )}
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image
            </label>
            <Input
              className={`${
                MP_DIALOG.input
              } file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 ${
                errors.featured_image ? "border-red-500" : ""
              }`}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFile}
            />
            <p className="mt-1 text-xs text-gray-500">
              Max 5MB. Supported: JPG, PNG, GIF, WEBP
            </p>
            {errors.featured_image && (
              <p className="mt-1 text-sm text-red-500">
                {errors.featured_image}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditListingDialog;
