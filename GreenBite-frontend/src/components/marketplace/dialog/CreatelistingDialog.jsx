import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/TextArea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { MP_DIALOG } from '@/components/ui/DialogTheme';
import { toast } from 'react-hot-toast';

const UNIT_OPTIONS = ["kg", "g", "L", "ml", "pcs"];

const CreateListingDialog = ({ open, onOpenChange, onSubmit }) => {
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    price: '',
    currency: 'EGP',
    quantity: '',
    unit: 'kg',
    available_until: '',
    featured_image: null, // File
  });

  const setField = (key) => (e) =>
    setForm((p) => ({
      ...p,
      [key]: e.target.value,
    }));

  const handleFile = (e) => {
    const file = e.target.files?.[0] ?? null;
    setForm((p) => ({ ...p, featured_image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
    // validate required fields before sending 
    if (!form.available_until) {
      toast.error("Please select an available-until date.");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),          //
      currency: form.currency || "EGP",
      quantity: Number(form.quantity),    
      unit: form.unit,
      available_until: form.available_until, 
      
    };
    if (form.featured_image instanceof File) {
      payload.featured_image = form.featured_image;
    }

    console.log("[CreateListingDialog] payload:", payload);

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
  } finally {
    setSubmitting(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MP_DIALOG.content}>
        <DialogHeader>
          <DialogTitle className={MP_DIALOG.title}>Create Listing</DialogTitle>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            className="bg-white text-slate-900 placeholder:text-slate-400 border-green-200"
            placeholder="Title"
            value={form.title}
            onChange={setField('title')}
            required
          />

          <Textarea
            className="bg-white text-slate-900 placeholder:text-slate-400 border-green-200"
            placeholder="Description"
            value={form.description}
            onChange={setField('description')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-400 border-green-200"
              type="number"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={setField('price')}
              required
            />
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-400 border-green-200"
              placeholder="Currency"
              value={form.currency}
              onChange={setField('currency')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-400 border-green-200"
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={setField('quantity')}
              required
            />

            <Select
              value={form.unit}
              onValueChange={(value) => setForm((p) => ({ ...p, unit: value }))}
            >
              <SelectTrigger className={MP_DIALOG.selectTrigger}>
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent className={MP_DIALOG.selectContent}>
                {UNIT_OPTIONS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            className={MP_DIALOG.input}
            type="date"
            value={form.available_until}
            onChange={setField('available_until')}
            required
          />

          <Input
            className={`${MP_DIALOG.input} file:text-slate-900`}
            type="file"
            accept="image/*"
            onChange={handleFile}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListingDialog;
