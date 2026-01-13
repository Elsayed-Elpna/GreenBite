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
import { toast } from "react-hot-toast";

const UNIT_OPTIONS = ["kg", "g", "L", "ml", "pcs"];

/* =======================
   Yup Validation Schema
======================= */
const createListingSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),

  description: yup.string().nullable(),

  price: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be greater than 0")
    .required("Price is required"),

  currency: yup.string().required("Currency is required"),

  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .positive("Quantity must be greater than 0")
    .required("Quantity is required"),

  unit: yup.string().required("Unit is required"),

  available_until: yup
    .date()
    .typeError("Please select a valid date")
    .min(new Date(), "Date must be in the future")
    .required("Available until date is required"),

  featured_image: yup
    .mixed()
    .nullable()
    .test(
      "fileType",
      "Only image files are allowed",
      (file) =>
        !file || (file instanceof File && file.type.startsWith("image/"))
    ),
});

const CreateListingDialog = ({ open, onOpenChange, onSubmit }) => {
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    price: "",
    currency: "EGP",
    quantity: "",
    unit: "kg",
    available_until: "",
    featured_image: null,
  });

  const setField = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0] ?? null;
    setForm((p) => ({ ...p, featured_image: file }));
    setErrors((p) => ({ ...p, featured_image: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      await createListingSchema.validate(form, { abortEarly: false });

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        currency: form.currency || "EGP",
        quantity: Number(form.quantity),
        unit: form.unit,
        available_until: form.available_until,
      };

      if (form.featured_image instanceof File) {
        payload.featured_image = form.featured_image;
      }

      await onSubmit?.(payload);

      onOpenChange?.(false);
      setForm({
        title: "",
        description: "",
        price: "",
        currency: "EGP",
        quantity: "",
        unit: "kg",
        available_until: "",
        featured_image: null,
      });
    } catch (err) {
      if (err.name === "ValidationError") {
        const fieldErrors = {};
        err.inner.forEach((e) => {
          fieldErrors[e.path] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-2 border-green-500 shadow-2xl shadow-green-500/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700">
            Create Listing
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* Title */}
          <Input
            className="bg-white border-2 border-green-400 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-green-600 transition-colors"
            placeholder="Title"
            value={form.title}
            onChange={setField("title")}
          />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title}</p>
          )}

          {/* Description */}
          <Textarea
            className="bg-white border-2 border-green-400 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-green-600 transition-colors resize-none"
            placeholder="Description"
            value={form.description}
            onChange={setField("description")}
          />

          {/* Price & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                className="bg-white border-2 border-green-400 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-green-600 transition-colors"
                value={form.price}
                onChange={setField("price")}
              />
              {errors.price && (
                <p className="text-xs text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <Input
                placeholder="Currency"
                className="bg-white border-2 border-green-400 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-green-600 transition-colors"
                value={form.currency}
                onChange={setField("currency")}
              />
              {errors.currency && (
                <p className="text-xs text-red-600">{errors.currency}</p>
              )}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Quantity"
                className="bg-white border-2 border-green-400 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-green-600 transition-colors"
                value={form.quantity}
                onChange={setField("quantity")}
              />
              {errors.quantity && (
                <p className="text-xs text-red-600">{errors.quantity}</p>
              )}
            </div>

            <div>
              <Select
                value={form.unit}
                onValueChange={(value) =>
                  setForm((p) => ({ ...p, unit: value }))
                }
              >
                <SelectTrigger className="bg-white border-2 border-green-400 text-gray-900 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-green-600 transition-colors [&>button]:outline-none [&>button]:focus:outline-none [&>button]:focus-visible:outline-none">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-green-400 text-gray-900 outline-none focus:outline-none focus-visible:outline-none">
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem
                      key={u}
                      value={u}
                      className="focus:bg-green-100 focus:text-green-900 outline-none focus:outline-none focus-visible:outline-none"
                    >
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-xs text-red-600">{errors.unit}</p>
              )}
            </div>
          </div>

          {/* Date */}
          <Input
            type="date"
            className="bg-white border-2 border-green-400 text-gray-900 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-green-600 transition-colors"
            value={form.available_until}
            onChange={setField("available_until")}
          />
          {errors.available_until && (
            <p className="text-xs text-red-600">{errors.available_until}</p>
          )}

          {/* Image */}
          <div className="relative">
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full px-4 py-2.5 bg-white border-2 border-green-400 rounded-md cursor-pointer hover:border-green-600 transition-colors outline-none focus:outline-none focus-visible:outline-none"
            >
              <span className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded mr-3 text-sm font-medium transition-colors">
                Choose File
              </span>
              <span className="text-gray-600 text-sm">
                {form.featured_image
                  ? form.featured_image.name
                  : "No file chosen"}
              </span>
            </label>
          </div>
          {errors.featured_image && (
            <p className="text-xs text-red-600">{errors.featured_image}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="border-2 border-green-500 text-green-700 hover:bg-green-50 outline-none focus:outline-none focus-visible:outline-none transition-colors"
              onClick={() => onOpenChange?.(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white outline-none focus:outline-none focus-visible:outline-none transition-colors shadow-lg shadow-green-600/30"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListingDialog;
