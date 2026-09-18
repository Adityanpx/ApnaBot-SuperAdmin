// components/nodeLibrary/NodeLibraryCard.jsx
'use client';

import { motion } from 'framer-motion';
import { Trash2, MapPin, List as ListIcon, ExternalLink } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

// options can arrive as plain strings or as {id/value, title/label/text} objects
function optionLabel(option, i) {
  if (typeof option === 'string') return option;
  return option?.title || option?.label || option?.text || `Option ${i + 1}`;
}

/**
 * NodeLibraryCard — one library entry rendered as a WhatsApp-style message
 * preview (so an admin can see what the node actually looks like in chat),
 * with the entry's metadata (category, type, keyword, date, delete) below it.
 *
 * Props:
 *   entry    object — a node library entry; message content lives under
 *            entry.nodeData (label, contentType, options, buttonText,
 *            imageUrl, latitude/longitude/locationName/address, keyword/fieldKey)
 *   index    number — stagger delay for the mount animation
 *   onDelete fn(entry)
 */
export default function NodeLibraryCard({ entry, index = 0, onDelete }) {
  const data = entry.nodeData || {};
  const category = CATEGORY_TEMPLATE_CATEGORIES.find((c) => c.value === entry.category);
  const identifier = entry.nodeType === 'question' ? data.fieldKey : data.keyword;
  const options = Array.isArray(data.options) ? data.options : [];

  const isLocation = data.contentType === 'location';
  const isButtons  = data.contentType === 'buttons' && options.length > 0;
  const isList     = data.contentType === 'list';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="card overflow-hidden flex flex-col"
    >
      {/* WhatsApp-style chat preview */}
      <div className="p-4 bg-[#0b141a]">
        <div className="rounded-lg overflow-hidden shadow-md bg-[#202c33]">
          {data.imageUrl && (
            <div className="h-32 w-full bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="px-3 py-2.5">
            {isLocation ? (
              <div className="rounded-md overflow-hidden border border-white/10">
                <div className="h-20 flex items-center justify-center bg-[#2a3942] text-[#00a884]">
                  <MapPin className="w-7 h-7" />
                </div>
                <div className="px-2.5 py-2 bg-[#1f2c33]">
                  <p className="text-[13px] font-medium text-white truncate">
                    {data.locationName || 'Shared location'}
                  </p>
                  {data.address && (
                    <p className="text-[11px] text-white/55 truncate mt-0.5">{data.address}</p>
                  )}
                </div>
              </div>
            ) : data.label ? (
              <p className="text-[13px] leading-snug text-white/90 whitespace-pre-wrap break-words">
                {data.label}
              </p>
            ) : (
              <p className="text-[13px] leading-snug text-white/35 italic">No message text</p>
            )}
          </div>

          {/* Buttons / list / CTA affordances — rendered as real-looking tappable rows */}
          {isButtons && (
            <div className="border-t border-white/10">
              {options.slice(0, 3).map((opt, i) => (
                <div
                  key={i}
                  className="px-3 py-2 text-center text-[13px] font-medium text-[#00a884] border-b border-white/10 last:border-b-0"
                >
                  {optionLabel(opt, i)}
                </div>
              ))}
            </div>
          )}

          {isList && (
            <div className="border-t border-white/10 px-3 py-2 flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#00a884]">
              <ListIcon className="w-3.5 h-3.5" />
              Choose an option
            </div>
          )}

          {data.buttonText && (
            <div className="border-t border-white/10 px-3 py-2 flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#00a884]">
              <ExternalLink className="w-3.5 h-3.5" />
              {data.buttonText}
            </div>
          )}
        </div>
      </div>

      {/* Metadata — same info the table used to show, now under the preview */}
      <div className="p-4 pt-3 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="brand">
            {category?.emoji ? `${category.emoji} ` : ''}{category?.label || entry.category}
          </Badge>
          <Badge variant={entry.nodeType === 'question' ? 'info' : 'neutral'}>
            {entry.nodeType}
          </Badge>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {data.label || identifier || 'Untitled'}
          </p>
          {identifier && (
            <p className="text-xs text-text-tertiary truncate mt-0.5">{identifier}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <span className="text-xs text-text-tertiary">{formatDate(entry.createdAt)}</span>
          <button
            onClick={() => onDelete(entry)}
            title="Remove from node library"
            className="
              w-8 h-8 flex items-center justify-center rounded-lg
              text-text-tertiary hover:text-danger-text hover:bg-danger-bg
              transition-colors duration-150
            "
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
