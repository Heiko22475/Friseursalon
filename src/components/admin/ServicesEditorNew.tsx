import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Star, GripVertical, Save } from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import type { Service } from '../../contexts/WebsiteContext';

export const ServicesEditorNew: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leistungen (NEU)</h1>
              <p className="text-sm text-gray-600">
                WebsiteContext - {services.length} Leistungen
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-rose-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-rose-600 transition"
          >
            <Plus className="w-5 h-5" />
            Neue Leistung
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">Noch keine Leistungen vorhanden</p>
            <button
              onClick={handleAdd}
              className="text-rose-500 hover:text-rose-600 font-medium"
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
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Nach oben"
                      >
                        <GripVertical className="w-5 h-5 rotate-90" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === services.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Nach unten"
                      >
                        <GripVertical className="w-5 h-5 -rotate-90" />
                      </button>
                    </div>

                    {/* Form */}
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) =>
                              handleUpdate(service.id, 'name', e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="z.B. Herrenhaarschnitt"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kategorie
                          </label>
                          <input
                            type="text"
                            value={service.category}
                            onChange={(e) =>
                              handleUpdate(service.id, 'category', e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="z.B. Herren"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beschreibung
                        </label>
                        <textarea
                          value={service.description}
                          onChange={(e) =>
                            handleUpdate(service.id, 'description', e.target.value)
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Beschreibung der Leistung..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preis (€)
                          </label>
                          <input
                            type="text"
                            value={service.price}
                            onChange={(e) =>
                              handleUpdate(service.id, 'price', e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="35"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="45"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-5 h-5 text-rose-500 rounded"
                            />
                            <Star
                              className={`w-5 h-5 ${
                                service.is_featured
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-500 hover:text-red-700 transition"
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
