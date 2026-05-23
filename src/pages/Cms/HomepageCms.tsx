import React, { useEffect, useMemo, useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import {
  getAdminHomepageCms,
  saveAdminHomepageCms,
  uploadCmsImage,
} from "../../services/api";
import "./HomepageCms.scss";

type CmsImage = {
  imageUrl: string;
  publicId?: string;
  alt?: string;
  href?: string;
  name?: string;
};

type CategoryCard = {
  category: "goma" | "fellne" | "aksesore";
  title: string;
  subtitle: string;
  imageUrl: string;
  publicId?: string;
  href: string;
};

type ReviewItem = {
  name: string;
  rating: number;
  text: string;
  avatarUrl?: string | null;
  avatarPublicId?: string;
};

type HomepageCmsType = {
  introPage: { imageUrl: string; publicId?: string };
  hero: { slides: CmsImage[] };
  brands: Array<{ name: string; imageUrl: string; publicId?: string; href?: string }>;
  categoryCards: CategoryCard[];
  promos: {
    left: { imageUrl: string; publicId?: string; alt?: string; href?: string } | null;
    right: { imageUrl: string; publicId?: string; alt?: string; href?: string } | null;
  };
  reviews: { title: string; items: ReviewItem[] };
  cta: {
    title: string;
    subtitle: string;
    imageUrl: string;
    publicId?: string;
    button: { label: string; href: string };
  };
};

const defaultCms: HomepageCmsType = {
  introPage: { imageUrl: "" },
  hero: { slides: [] },
  brands: [],
  categoryCards: [
    { category: "goma", title: "", subtitle: "", imageUrl: "", href: "" },
    { category: "fellne", title: "", subtitle: "", imageUrl: "", href: "" },
    { category: "aksesore", title: "", subtitle: "", imageUrl: "", href: "" },
  ],
  promos: { left: null, right: null },
  reviews: { title: "", items: [] },
  cta: { title: "", subtitle: "", imageUrl: "", button: { label: "", href: "" } },
};

function clampRating(n: any) {
  const v = Number(n);
  if (Number.isNaN(v)) return 5;
  if (v < 1) return 1;
  if (v > 5) return 5;
  return Math.round(v);
}

const HomepageCms = () => {
  const [cms, setCms] = useState<HomepageCmsType>(defaultCms);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSave = useMemo(() => !saving && !loading, [saving, loading]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminHomepageCms();
        setCms((prev) => ({ ...prev, ...(data ?? {}) }));
      } catch (e: any) {
        setError("Nuk u arrit të ngarkohet CMS.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await saveAdminHomepageCms(cms);
      setSuccess("U ruajt me sukses.");
      setTimeout(() => setSuccess(null), 2500);
    } catch (e: any) {
      setError("Nuk u arrit të ruhet CMS.");
    } finally {
      setSaving(false);
    }
  };

  const doUpload = async (file: File, folder: string, key: string) => {
    setUploadingKey(key);
    setError(null);
    try {
      const res = await uploadCmsImage(file, folder);
      return res;
    } catch (e: any) {
      setError("Ngarkimi i fotos dështoi.");
      return null;
    } finally {
      setUploadingKey(null);
    }
  };

  const addHeroSlide = () => {
    setCms((p) => ({
      ...p,
      hero: {
        ...p.hero,
        slides: [...(p.hero?.slides ?? []), { imageUrl: "", alt: "", href: "" }],
      },
    }));
  };

  const removeHeroSlide = (idx: number) => {
    setCms((p) => ({
      ...p,
      hero: {
        ...p.hero,
        slides: (p.hero?.slides ?? []).filter((_, i) => i !== idx),
      },
    }));
  };

  const addBrand = () => {
    setCms((p) => ({
      ...p,
      brands: [...(p.brands ?? []), { name: "", imageUrl: "", href: "" }],
    }));
  };

  const removeBrand = (idx: number) => {
    setCms((p) => ({
      ...p,
      brands: (p.brands ?? []).filter((_, i) => i !== idx),
    }));
  };

  const addReview = () => {
    setCms((p) => ({
      ...p,
      reviews: {
        ...p.reviews,
        items: [...(p.reviews?.items ?? []), { name: "", rating: 5, text: "", avatarUrl: null }],
      },
    }));
  };

  const removeReview = (idx: number) => {
    setCms((p) => ({
      ...p,
      reviews: {
        ...p.reviews,
        items: (p.reviews?.items ?? []).filter((_, i) => i !== idx),
      },
    }));
  };

  return (
    <Dashboard pageTitle={"CMS"}>
      <div className="cmsPage">
        <div className="cmsHeader">
          <div>
            <h2>Homepage CMS</h2>
            <p>Ndrysho seksionet e homepage dhe ruaj ndryshimet.</p>
          </div>
          <div className="cmsHeaderActions">
            <button className="cmsBtn" disabled={!canSave} onClick={save}>
              {saving ? "Duke ruajtur..." : "Ruaj"}
            </button>
          </div>
        </div>

        {error && <div className="cmsAlert error">{error}</div>}
        {success && <div className="cmsAlert success">{success}</div>}

        <div className="cmsSection">
          <div className="cmsSectionTitle">
            <h3>Intro Page</h3>
          </div>
          <div className="cmsGrid two">
            <div className="cmsCard">
              <div className="cmsRow">
                <label>Foto e sfondit (faqja kryesore e hyrjes)</label>
                <div className="cmsUploadRow">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const res = await doUpload(file, "intropage", "introPage");
                      if (!res) return;
                      setCms((p) => ({
                        ...p,
                        introPage: { imageUrl: res.url, publicId: res.publicId },
                      }));
                    }}
                  />
                  {uploadingKey === "introPage" && <span className="cmsInline">Duke ngarkuar...</span>}
                </div>
                {cms.introPage?.imageUrl ? (
                  <img className="cmsPreview" src={cms.introPage.imageUrl} alt="" />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="cmsSection">
          <div className="cmsSectionTitle">
            <h3>Hero Slides</h3>
            <button className="cmsBtn ghost" onClick={addHeroSlide}>Shto slide</button>
          </div>

          <div className="cmsGrid">
            {(cms.hero?.slides ?? []).map((s, idx) => (
              <div className="cmsCard" key={`hero-${idx}`}>
                <div className="cmsCardTop">
                  <h4>Slide #{idx + 1}</h4>
                  <button className="cmsBtn danger" onClick={() => removeHeroSlide(idx)}>Hiq</button>
                </div>

                <div className="cmsRow">
                  <label>Foto</label>
                  <div className="cmsUploadRow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const res = await doUpload(file, "homepage/hero", `hero-${idx}`);
                        if (!res) return;
                        setCms((p) => {
                          const slides = [...(p.hero?.slides ?? [])];
                          slides[idx] = { ...slides[idx], imageUrl: res.url, publicId: res.publicId };
                          return { ...p, hero: { ...p.hero, slides } };
                        });
                      }}
                    />
                    {uploadingKey === `hero-${idx}` && <span className="cmsInline">Duke ngarkuar...</span>}
                  </div>
                  {s.imageUrl ? <img className="cmsPreview" src={s.imageUrl} alt="" /> : null}
                </div>

                <div className="cmsRow">
                  <label>Alt</label>
                  <input
                    className="cmsInput"
                    value={s.alt ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCms((p) => {
                        const slides = [...(p.hero?.slides ?? [])];
                        slides[idx] = { ...slides[idx], alt: v };
                        return { ...p, hero: { ...p.hero, slides } };
                      });
                    }}
                  />
                </div>

                <div className="cmsRow">
                  <label>Link</label>
                  <input
                    className="cmsInput"
                    value={s.href ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCms((p) => {
                        const slides = [...(p.hero?.slides ?? [])];
                        slides[idx] = { ...slides[idx], href: v };
                        return { ...p, hero: { ...p.hero, slides } };
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cmsSection">
          <div className="cmsSectionTitle">
            <h3>Brands</h3>
            <button className="cmsBtn ghost" onClick={addBrand}>Shto brand</button>
          </div>

          <div className="cmsGrid">
            {(cms.brands ?? []).map((b, idx) => (
              <div className="cmsCard" key={`brand-${idx}`}>
                <div className="cmsCardTop">
                  <h4>Brand #{idx + 1}</h4>
                  <button className="cmsBtn danger" onClick={() => removeBrand(idx)}>Hiq</button>
                </div>

                <div className="cmsRow">
                  <label>Emri</label>
                  <input
                    className="cmsInput"
                    value={b.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCms((p) => {
                        const brands = [...(p.brands ?? [])];
                        brands[idx] = { ...brands[idx], name: v };
                        return { ...p, brands };
                      });
                    }}
                  />
                </div>

                <div className="cmsRow">
                  <label>Foto</label>
                  <div className="cmsUploadRow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const res = await doUpload(file, "homepage/brands", `brand-${idx}`);
                        if (!res) return;
                        setCms((p) => {
                          const brands = [...(p.brands ?? [])];
                          brands[idx] = { ...brands[idx], imageUrl: res.url, publicId: res.publicId };
                          return { ...p, brands };
                        });
                      }}
                    />
                    {uploadingKey === `brand-${idx}` && <span className="cmsInline">Duke ngarkuar...</span>}
                  </div>
                  {b.imageUrl ? <img className="cmsPreview" src={b.imageUrl} alt="" /> : null}
                </div>

                <div className="cmsRow">
                  <label>Link</label>
                  <input
                    className="cmsInput"
                    value={b.href ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCms((p) => {
                        const brands = [...(p.brands ?? [])];
                        brands[idx] = { ...brands[idx], href: v };
                        return { ...p, brands };
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cmsSection">
          <div className="cmsSectionTitle">
            <h3>Category Cards</h3>
          </div>

          <div className="cmsGrid">
            {(cms.categoryCards ?? defaultCms.categoryCards).slice(0, 3).map((c, idx) => (
              <div className="cmsCard" key={`cat-${idx}`}>
                <div className="cmsCardTop">
                  <h4>Karta #{idx + 1}</h4>
                </div>

                <div className="cmsRow">
                  <label>Kategoria</label>
                  <select
                    className="cmsInput"
                    value={c.category}
                    onChange={(e) => {
                      const v = e.target.value as any;
                      setCms((p) => {
                        const cards = [...(p.categoryCards ?? defaultCms.categoryCards)];
                        cards[idx] = { ...cards[idx], category: v };
                        return { ...p, categoryCards: cards };
                      });
                    }}
                  >
                    <option value="goma">goma</option>
                    <option value="fellne">fellne</option>
                    <option value="aksesore">aksesore</option>
                  </select>
                </div>

                <div className="cmsRow">
                  <label>Titulli</label>
                  <input
                    className="cmsInput"
                    value={c.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCms((p) => {
                        const cards = [...(p.categoryCards ?? defaultCms.categoryCards)];
                        cards[idx] = { ...cards[idx], title: v };
                        return { ...p, categoryCards: cards };
                      });
                    }}
                  />
                </div>

                <div className="cmsRow">
                  <label>Nëntitulli</label>
                  <input
                    className="cmsInput"
                    value={c.subtitle}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCms((p) => {
                        const cards = [...(p.categoryCards ?? defaultCms.categoryCards)];
                        cards[idx] = { ...cards[idx], subtitle: v };
                        return { ...p, categoryCards: cards };
                      });
                    }}
                  />
                </div>

                <div className="cmsRow">
                  <label>Foto</label>
                  <div className="cmsUploadRow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const res = await doUpload(file, "homepage/categories", `cat-${idx}`);
                        if (!res) return;
                        setCms((p) => {
                          const cards = [...(p.categoryCards ?? defaultCms.categoryCards)];
                          cards[idx] = { ...cards[idx], imageUrl: res.url, publicId: res.publicId };
                          return { ...p, categoryCards: cards };
                        });
                      }}
                    />
                    {uploadingKey === `cat-${idx}` && <span className="cmsInline">Duke ngarkuar...</span>}
                  </div>
                  {c.imageUrl ? <img className="cmsPreview" src={c.imageUrl} alt="" /> : null}
                </div>

                <div className="cmsRow">
                  <label>Link</label>
                  <input
                    className="cmsInput"
                    value={c.href}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCms((p) => {
                        const cards = [...(p.categoryCards ?? defaultCms.categoryCards)];
                        cards[idx] = { ...cards[idx], href: v };
                        return { ...p, categoryCards: cards };
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cmsSection">
          <div className="cmsSectionTitle">
            <h3>Promo Images (Side by Side)</h3>
          </div>

          <div className="cmsGrid two">
            {["left", "right"].map((side) => {
              const promo = (cms.promos as any)?.[side] as any;
              const key = `promo-${side}`;
              return (
                <div className="cmsCard" key={key}>
                  <div className="cmsCardTop">
                    <h4>{side === "left" ? "Majtas" : "Djathtas"}</h4>
                  </div>

                  <div className="cmsRow">
                    <label>Foto</label>
                    <div className="cmsUploadRow">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const res = await doUpload(file, `homepage/promos/${side}`, key);
                          if (!res) return;
                          setCms((p) => ({
                            ...p,
                            promos: {
                              ...p.promos,
                              [side]: { ...(p.promos as any)?.[side], imageUrl: res.url, publicId: res.publicId },
                            } as any,
                          }));
                        }}
                      />
                      {uploadingKey === key && <span className="cmsInline">Duke ngarkuar...</span>}
                    </div>
                    {promo?.imageUrl ? <img className="cmsPreview" src={promo.imageUrl} alt="" /> : null}
                  </div>

                  <div className="cmsRow">
                    <label>Alt</label>
                    <input
                      className="cmsInput"
                      value={promo?.alt ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCms((p) => ({
                          ...p,
                          promos: {
                            ...p.promos,
                            [side]: { ...(p.promos as any)?.[side], alt: v },
                          } as any,
                        }));
                      }}
                    />
                  </div>

                  <div className="cmsRow">
                    <label>Link</label>
                    <input
                      className="cmsInput"
                      value={promo?.href ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCms((p) => ({
                          ...p,
                          promos: {
                            ...p.promos,
                            [side]: { ...(p.promos as any)?.[side], href: v },
                          } as any,
                        }));
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cmsSection">
          <div className="cmsSectionTitle">
            <h3>Client Reviews</h3>
            <button className="cmsBtn ghost" onClick={addReview}>Shto review</button>
          </div>

          <div className="cmsGrid">
            {(cms.reviews?.items ?? []).map((r, idx) => (
              <div className="cmsCard" key={`review-${idx}`}>
                <div className="cmsCardTop">
                  <h4>Review #{idx + 1}</h4>
                  <button className="cmsBtn danger" onClick={() => removeReview(idx)}>Hiq</button>
                </div>

                <div className="cmsRow">
                  <label>Emri</label>
                  <input
                    className="cmsInput"
                    value={r.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCms((p) => {
                        const items = [...(p.reviews?.items ?? [])];
                        items[idx] = { ...items[idx], name: v };
                        return { ...p, reviews: { ...p.reviews, items } };
                      });
                    }}
                  />
                </div>

                <div className="cmsRow">
                  <label>Rating (1-5)</label>
                  <input
                    className="cmsInput"
                    type="number"
                    min={1}
                    max={5}
                    value={r.rating}
                    onChange={(e) => {
                      const v = clampRating(e.target.value);
                      setCms((p) => {
                        const items = [...(p.reviews?.items ?? [])];
                        items[idx] = { ...items[idx], rating: v };
                        return { ...p, reviews: { ...p.reviews, items } };
                      });
                    }}
                  />
                </div>

                <div className="cmsRow">
                  <label>Teksti</label>
                  <textarea
                    className="cmsTextarea"
                    value={r.text}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCms((p) => {
                        const items = [...(p.reviews?.items ?? [])];
                        items[idx] = { ...items[idx], text: v };
                        return { ...p, reviews: { ...p.reviews, items } };
                      });
                    }}
                  />
                </div>

                <div className="cmsRow">
                  <label>Avatar (opsionale)</label>
                  <div className="cmsUploadRow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const res = await doUpload(file, "homepage/reviews", `review-${idx}`);
                        if (!res) return;
                        setCms((p) => {
                          const items = [...(p.reviews?.items ?? [])];
                          items[idx] = { ...items[idx], avatarUrl: res.url, avatarPublicId: res.publicId };
                          return { ...p, reviews: { ...p.reviews, items } };
                        });
                      }}
                    />
                    {uploadingKey === `review-${idx}` && <span className="cmsInline">Duke ngarkuar...</span>}
                  </div>
                  {r.avatarUrl ? <img className="cmsPreview" src={r.avatarUrl} alt="" /> : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cmsSection">
          <div className="cmsSectionTitle">
            <h3>CTA (Before Footer)</h3>
          </div>

          <div className="cmsGrid two">
            <div className="cmsCard">
              <div className="cmsRow">
                <label>Titulli</label>
                <input
                  className="cmsInput"
                  value={cms.cta?.title ?? ""}
                  onChange={(e) => setCms((p) => ({ ...p, cta: { ...p.cta, title: e.target.value } }))}
                />
              </div>

              <div className="cmsRow">
                <label>Nëntitulli</label>
                <input
                  className="cmsInput"
                  value={cms.cta?.subtitle ?? ""}
                  onChange={(e) => setCms((p) => ({ ...p, cta: { ...p.cta, subtitle: e.target.value } }))}
                />
              </div>

              <div className="cmsRow">
                <label>Teksti i butonit</label>
                <input
                  className="cmsInput"
                  value={cms.cta?.button?.label ?? ""}
                  onChange={(e) =>
                    setCms((p) => ({
                      ...p,
                      cta: { ...p.cta, button: { ...p.cta.button, label: e.target.value } },
                    }))
                  }
                />
              </div>

              <div className="cmsRow">
                <label>Link i butonit</label>
                <input
                  className="cmsInput"
                  value={cms.cta?.button?.href ?? ""}
                  onChange={(e) =>
                    setCms((p) => ({
                      ...p,
                      cta: { ...p.cta, button: { ...p.cta.button, href: e.target.value } },
                    }))
                  }
                />
              </div>
            </div>

            <div className="cmsCard">
              <div className="cmsRow">
                <label>Foto</label>
                <div className="cmsUploadRow">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const res = await doUpload(file, "homepage/cta", "cta");
                      if (!res) return;
                      setCms((p) => ({
                        ...p,
                        cta: { ...p.cta, imageUrl: res.url, publicId: res.publicId },
                      }));
                    }}
                  />
                  {uploadingKey === "cta" && <span className="cmsInline">Duke ngarkuar...</span>}
                </div>
                {cms.cta?.imageUrl ? <img className="cmsPreview" src={cms.cta.imageUrl} alt="" /> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default HomepageCms;
