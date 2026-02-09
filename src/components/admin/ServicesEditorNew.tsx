import React, { useState } from 'react';
import { Plus, Trash2, Star, GripVertical, Save } from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { useWebsite } from '../../contexts/WebsiteContext';
import type { Service } from '../../contexts/WebsiteContext';

export const ServicesEditorNew: React.FC = () => {
  const { website, updateServices, addService, deleteService, updateService } = useWebsite();
  const [saving, setSaving] = useState(false);

  const services = website?.services || [];

  const handleAdd = async () => {
    const newService: Omit<Service, 'id'> = {
      name: 'Neue Leistung',
      description: '',
      price: '0',
      duration: 30,
      category: 'Allgemein',
      is_featured: false,
      display_order: services.length,
    };

    try {
      await addService(newService);
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Fehler beim Hinzufügen der Leistung');
    }
  };

  const handleUpdate = async (id: string, field: keyof Service, value: any) => {
    try {
      await updateService(id, { [field]: value });
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Leistung wirklich löschen?')) return;

    try {
      await deleteService(id);
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const reordered = [...services];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Update display_order
    const updated = reordered.map((s, i) => ({ ...s, display_order: i }));

    try {
      setSaving(true);
      await updateServices(updated);
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Fehler beim Sortieren');
    } finally {
      setSaving(false);
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      handleReorder(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < services.length - 1) {
      handleReorder(index, index + 1);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Leistungen"
        subtitle={`${services.length} Leistungen`}
        sticky
        actions={
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 text-white px-6 py-2.5 rounded-lg font-semibold transition"
            style={{ backgroundColor: 'var(--admin-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus className="w-5 h-5" />
            Neue Leistung
          </button>
        }
      />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {services.length === 0 ? (
          <div className="rounded-lg p-12 text-center" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
            <p className="mb-4" style={{ color: 'var(--admin-text-muted)' }}>Noch keine Leistungen vorhanden</p>
            <button
              onClick={handleAdd}
              className="font-medium"
              style={{ color: 'var(--admin-accent)' }}
            >
              Erste Leistung erstellen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {services
              .sort((a, b) => a.display_order - b.display_order)
              .map((service, index) => (
                <div
                  key={service.id}
                  className="rounded-lg p-6 transition"
                  style={{ backgroundColor: 'var(--admin-bg-card)' }}
                >
                  <div className="flex items-start gap-4">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="disabled:opacity-30"
                        style={{ color: 'var(--admin-text-faint)' }}
                        title="Nach oben"
                      >
                        <GripVertical className="w-5 h-5 rotate-90" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === services.length - 1}
                        className="disabled:opacity-30"
                        style={{ color: 'var(--admin-text-faint)' }}
                        title="Nach unten"
                      >
                        <GripVertical className="w-5 h-5 -rotate-90" />
                      </button>
                    </div>

                    {/* Form */}
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                            Name
                          </label>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) =>
                              handleUpdate(service.id, 'name', e.target.value)
                            }
                            className="w-full rounded-lg px-3 py-2"
                            style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                            placeholder="z.B. Herrenhaarschnitt"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                            Kategorie
                          </label>
                          <input
                            type="text"
                            value={service.category}
                            onChange={(e) =>
                              handleUpdate(service.id, 'category', e.target.value)
                            }
                            className="w-full rounded-lg px-3 py-2"
                            style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                            placeholder="z.B. Herren"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                          Beschreibung
                        </label>
                        <textarea
                          value={service.description}
                          onChange={(e) =>
                            handleUpdate(service.id, 'description', e.target.value)
                          }
                          className="w-full rounded-lg px-3 py-2"
                          style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                          placeholder="Beschreibung der Leistung..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                            Preis (€)
                          </label>
                          <input
                            type="text"
                            value={service.price}
                            onChange={(e) =>
                              handleUpdate(service.id, 'price', e.target.value)
                            }
                            className="w-full rounded-lg px-3 py-2"
                            style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                            placeholder="35"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                            Dauer (Min.)
                          </label>
                          <input
                            type="number"
                            value={service.duration}
                            onChange={(e) =>
                              handleUpdate(
                                service.id,
                                'duration',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full rounded-lg px-3 py-2"
                            style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                            placeholder="45"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                            Featured
                          </label>
                          <label className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              checked={service.is_featured}
                              onChange={(e) =>
                                handleUpdate(
                                  service.id,
                                  'is_featured',
                                  e.target.checked
                                )
                              }
                              className="w-5 h-5 rounded"
                              style={{ accentColor: 'var(--admin-accent)' }}
                            />
                            <Star
                              className={`w-5 h-5 ${
                                service.is_featured
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : ''
                              }`}
                              style={!service.is_featured ? { color: 'var(--admin-text-faint)' } : {}}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="transition"
                      style={{ color: 'var(--admin-danger)' }}
                      title="Löschen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {saving && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Save className="w-5 h-5" />
            Gespeichert!
          </div>
        )}
      </main>
    </div>
  );
};
