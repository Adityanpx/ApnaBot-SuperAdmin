// components/flowPacks/FlowMap.jsx
'use client';

import { useMemo, useState } from 'react';
import dagre from 'dagre';
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize2, Minimize2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { EMPTY_RULE, getRuleKey } from './RuleEditor';

/**
 * FlowMap — visual node-graph view over the SAME rules array RuleEditor.jsx
 * edits. Everything here is a pure local-state transform: every interaction
 * ends in a single onChange(updatedRules) call, exactly like RuleEditor.
 * There is no per-rule persistence — the whole pack is only ever saved by
 * EditFlowPackModal's "Save Flow Pack" button.
 *
 * Ported from apnabot-web's FlowMap.tsx (which operates on persisted Rule
 * documents with real _id's and fires a PUT /rules/:id per edit). See the
 * deviations called out inline below.
 */

const NODE_WIDTH = 270;
const GHOST_SIZE = 40;
const BODY_TEXT_LIMIT = 120;
const MAX_VISIBLE_LIST_OPTIONS = 4;

// This repo's semantic color tokens (see app/globals.css) replace apnabot-web's
// var(--teal)/var(--amber)/var(--danger) "paper" theme. The reply-type -> color
// mapping matches the one RuleEditor.jsx's RuleRow already uses, for consistency
// within this same modal.
const REPLY_TYPE_STYLE = {
  text:            { bg: 'var(--info-bg)',    border: 'var(--info-text)',    color: 'var(--info-text)' },
  booking_trigger: { bg: 'var(--warning-bg)', border: 'var(--warning-text)', color: 'var(--warning-text)' },
  payment_trigger: { bg: 'var(--success-bg)', border: 'var(--success-text)', color: 'var(--success-text)' },
};

const REPLY_TYPE_ICON = {
  text: '💬',
  booking_trigger: '🚖',
  payment_trigger: '💳',
};

const REPLY_TYPE_TITLE = {
  text: 'Text reply',
  booking_trigger: 'Starts a booking',
  payment_trigger: 'Sends a payment link',
};

function truncate(text, limit) {
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function handleId(kind, ruleKey, index) {
  return `${kind === 'button' ? 'btn' : 'opt'}-${ruleKey}-${index}`;
}

function parseHandleId(id) {
  const match = /^(btn|opt)-(.+)-(\d+)$/.exec(id);
  if (!match) return null;
  return { kind: match[1] === 'btn' ? 'button' : 'listOption', ruleKey: match[2], index: Number(match[3]) };
}

function generatePlaceholderKeyword(rules) {
  const existing = new Set(rules.map((r) => (r.keyword || '').trim().toLowerCase()));
  let n = 1;
  while (existing.has(`new-reply-${n}`)) n++;
  return `new-reply-${n}`;
}

function RuleMessageNode({ data, isConnectable }) {
  const { rule, ruleKey, orphan } = data;
  const palette = REPLY_TYPE_STYLE[rule.replyType] || REPLY_TYPE_STYLE.text;
  const icon = REPLY_TYPE_ICON[rule.replyType] || REPLY_TYPE_ICON.text;
  const listOptions = rule.listOptions || [];
  const visibleListOptions = listOptions.slice(0, MAX_VISIBLE_LIST_OPTIONS);
  const extraListCount = listOptions.length - visibleListOptions.length;

  return (
    <div
      style={{
        width: NODE_WIDTH,
        borderRadius: 14,
        border: `1px ${orphan ? 'dashed' : 'solid'} var(--border)`,
        borderLeft: `3px solid ${palette.border}`,
        background: 'var(--bg-raised)',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        overflow: 'visible',
        padding: 10,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: palette.border, border: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        style={{ background: palette.border, border: 'none' }}
      />

      {/* trigger — what the customer sent */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '3px 9px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '82%',
          }}
        >
          Customer says &quot;{truncate(rule.keyword || '(empty)', 22)}&quot;
        </span>
        <span
          title={`Match type: ${rule.matchType}`}
          style={{
            flexShrink: 0,
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: 13,
            height: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'help',
          }}
        >
          ?
        </span>
      </div>

      {/* bot reply — WhatsApp-style bubble */}
      <div
        style={{
          position: 'relative',
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          borderRadius: '4px 14px 14px 14px',
          padding: '8px 10px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <span
          title={REPLY_TYPE_TITLE[rule.replyType] || REPLY_TYPE_TITLE.text}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: palette.bg,
            border: `1px solid ${palette.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            lineHeight: 1,
          }}
        >
          {icon}
        </span>

        {rule.replyImageUrl && (
          <img
            src={rule.replyImageUrl}
            alt=""
            style={{
              width: '100%',
              height: 80,
              objectFit: 'cover',
              borderRadius: 8,
              marginBottom: 6,
              display: 'block',
            }}
          />
        )}
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            lineHeight: 1.4,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {rule.reply ? truncate(rule.reply, BODY_TEXT_LIMIT) : <span style={{ color: 'var(--text-tertiary)' }}>(no reply text)</span>}
        </p>

        {rule.buttons && rule.buttons.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {rule.buttons.map((b, i) => (
              <span
                key={i}
                style={{
                  position: 'relative',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--info-text)',
                  background: 'var(--info-bg)',
                  border: '1px solid var(--info-text)',
                  borderRadius: 8,
                  padding: '5px 10px',
                  textAlign: 'center',
                  paddingRight: isConnectable ? 18 : 10,
                }}
              >
                {b.title || 'Button'}
                {isConnectable && (
                  <Handle
                    type="source"
                    id={handleId('button', ruleKey, i)}
                    position={Position.Right}
                    isConnectable
                    title={`Drag to link "${b.title || 'Button'}" to another reply`}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: -3,
                      transform: 'translateY(-50%)',
                      width: 8,
                      height: 8,
                      background: 'var(--info-text)',
                      border: '1px solid white',
                    }}
                  />
                )}
              </span>
            ))}
          </div>
        )}

        {visibleListOptions.length > 0 && (
          <div style={{ marginTop: 8, borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {visibleListOptions.map((o, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  padding: '6px 9px',
                  paddingRight: isConnectable ? 20 : 9,
                  borderLeft: '2px solid var(--info-bg)',
                  borderBottom: i < visibleListOptions.length - 1 || extraListCount > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>{o.label || 'Option'}</p>
                {o.description && (
                  <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-tertiary)' }}>{truncate(o.description, 40)}</p>
                )}
                {isConnectable && (
                  <Handle
                    type="source"
                    id={handleId('listOption', ruleKey, i)}
                    position={Position.Right}
                    isConnectable
                    title={`Drag to link "${o.label || 'Option'}" to another reply`}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: -3,
                      transform: 'translateY(-50%)',
                      width: 8,
                      height: 8,
                      background: 'var(--info-text)',
                      border: '1px solid white',
                    }}
                  />
                )}
              </div>
            ))}
            {extraListCount > 0 && (
              <div style={{ padding: '4px 9px', fontSize: 10.5, color: 'var(--text-tertiary)' }}>+{extraListCount} more</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const nodeTypes = { ruleMessage: RuleMessageNode };

function estimateRuleNodeHeight(rule) {
  let height = 10 + 20 + 6 + 16 + 10;
  const bodyText = rule.reply ? truncate(rule.reply, BODY_TEXT_LIMIT) : '';
  const approxLines = Math.max(1, Math.ceil(bodyText.length / 34));
  height += Math.min(approxLines, 4) * 17;
  if (rule.replyImageUrl) height += 86;
  if (rule.buttons && rule.buttons.length > 0) height += 36;
  if (rule.listOptions && rule.listOptions.length > 0) {
    const shown = Math.min(rule.listOptions.length, MAX_VISIBLE_LIST_OPTIONS);
    height += shown * 36 + (rule.listOptions.length > MAX_VISIBLE_LIST_OPTIONS ? 20 : 0) + 8;
  }
  return Math.max(height, 96);
}

function layout(nodeInputs, edgeInputs) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 130 });
  nodeInputs.forEach((n) => g.setNode(n.id, { width: n.width, height: n.height }));
  edgeInputs.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  const positions = new Map();
  nodeInputs.forEach((n) => {
    const pos = g.node(n.id);
    positions.set(n.id, { x: pos.x - n.width / 2, y: pos.y - n.height / 2 });
  });
  return positions;
}

/**
 * Props:
 *   rules        array         — current rules array (same shape RuleEditor.jsx renders)
 *   onChange     fn(arr)       — called with the updated rules array on every mutation
 *   onFocusRule  fn(rule, key) — called when a real rule node is clicked, so the parent
 *                                can switch to List view and scroll/highlight that rule
 */
export default function FlowMap({ rules, onChange, onFocusRule }) {
  const [editMode, setEditMode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { nodes, edges } = useMemo(() => buildGraph(rules), [rules]);

  // Mutate a single button/listOption's nextKeyword on the source rule and push the
  // whole array through onChange — this replaces the original's `api.put(/rules/:id)`.
  const setLinkKeyword = (link, nextKeyword) => {
    const updated = rules.map((r, i) => {
      if (getRuleKey(r, i) !== link.ruleKey) return r;
      if (link.kind === 'button') {
        const buttons = (r.buttons || []).map((b, bi) => (bi === link.index ? { ...b, nextKeyword } : b));
        return { ...r, buttons };
      }
      const listOptions = (r.listOptions || []).map((o, oi) => (oi === link.index ? { ...o, nextKeyword } : o));
      return { ...r, listOptions };
    });
    onChange(updated);
  };

  const linkLabel = (link, sourceRule) =>
    (link.kind === 'button' ? sourceRule.buttons?.[link.index]?.title : sourceRule.listOptions?.[link.index]?.label) ||
    'this option';

  // Ghost node click, or drag-to-empty-space: append a new rule locally instead of
  // opening a "New reply" modal (there isn't one here — editing happens inline).
  const createRuleFromPending = (pending) => {
    const { targetKeyword } = pending;
    const typedKeyword = (targetKeyword || '').trim();
    let baseRules = rules;

    let newKeyword = typedKeyword;
    if (!newKeyword) {
      // Dragged to empty canvas — nothing was typed, so mint a placeholder keyword
      // and point the source button/option at it so the link resolves immediately.
      newKeyword = generatePlaceholderKeyword(rules);
      baseRules = rules.map((r, i) => {
        if (getRuleKey(r, i) !== pending.ruleKey) return r;
        if (pending.kind === 'button') {
          const buttons = (r.buttons || []).map((b, bi) => (bi === pending.index ? { ...b, nextKeyword: newKeyword } : b));
          return { ...r, buttons };
        }
        const listOptions = (r.listOptions || []).map((o, oi) => (oi === pending.index ? { ...o, nextKeyword: newKeyword } : o));
        return { ...r, listOptions };
      });
    }

    const newRule = { ...EMPTY_RULE, keyword: newKeyword, _tempId: Date.now() };
    const updated = [...baseRules, newRule];
    onChange(updated);
    onFocusRule?.(newRule, getRuleKey(newRule, updated.length - 1));
  };

  const onNodeClick = (_event, node) => {
    const data = node.data || {};
    if (data.pendingLink) {
      createRuleFromPending(data.pendingLink);
      return;
    }
    if (editMode) return;
    if (data.rule) onFocusRule?.(data.rule, data.ruleKey);
  };

  const onConnect = (connection) => {
    if (!editMode) return;
    const { sourceHandle, target } = connection;
    if (!sourceHandle || !target) return;
    const link = parseHandleId(sourceHandle);
    if (!link) return;
    const sourceRule = rules.find((r, i) => getRuleKey(r, i) === link.ruleKey);
    const targetRule = rules.find((r, i) => getRuleKey(r, i) === target);
    if (!sourceRule || !targetRule) return;
    if (!window.confirm(`Link "${linkLabel(link, sourceRule)}" to "${targetRule.keyword}" rule?`)) return;
    setLinkKeyword(link, targetRule.keyword);
  };

  const onConnectEnd = (_event, connectionState) => {
    if (!editMode || connectionState.isValid || connectionState.toNode) return;
    const fromHandleId = connectionState.fromHandle?.id;
    if (!fromHandleId) return;
    const link = parseHandleId(fromHandleId);
    if (link) createRuleFromPending({ ...link, targetKeyword: '' });
  };

  const onEdgeClick = (event, edge) => {
    if (!editMode) return;
    event.stopPropagation();
    const link = parseHandleId(edge.id);
    if (!link) return;
    const sourceRule = rules.find((r, i) => getRuleKey(r, i) === link.ruleKey);
    if (!sourceRule) return;
    if (!window.confirm(`Remove the link from "${linkLabel(link, sourceRule)}"?`)) return;
    setLinkKeyword(link, '');
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-text-tertiary">
          {editMode
            ? "Drag from a button/option's dot to another reply to link it, drag to empty space to create a new reply, or click a connection to remove it."
            : 'Click a reply to edit it in List view.'}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant={editMode ? 'primary' : 'secondary'} size="sm" onClick={() => setEditMode((v) => !v)}>
            {editMode ? 'Done editing connections' : 'Edit connections'}
          </Button>
          <Button type="button" variant="secondary" size="sm" icon={expanded ? Minimize2 : Maximize2} onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      <div
        style={{ height: expanded ? 640 : 420 }}
        className="bg-bg-raised border border-border rounded-2xl shadow-card overflow-hidden transition-[height] duration-200"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onEdgeClick={onEdgeClick}
          nodesDraggable={false}
          nodesConnectable={editMode}
          edgesFocusable={editMode}
          panOnScroll
          zoomOnScroll
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

function buildGraph(rules) {
  const keywordToRuleKey = new Map();
  rules.forEach((r, i) => keywordToRuleKey.set((r.keyword || '').trim().toLowerCase(), getRuleKey(r, i)));

  const layoutNodes = [];
  const layoutEdges = [];
  const rfEdges = [];
  const ghostNodes = [];
  const incomingTargets = new Set();

  rules.forEach((r, i) => layoutNodes.push({ id: getRuleKey(r, i), width: NODE_WIDTH, height: estimateRuleNodeHeight(r) }));

  let ghostCounter = 0;
  rules.forEach((rule, i) => {
    const ruleKey = getRuleKey(rule, i);
    (rule.buttons || []).forEach((b, bi) => {
      addLink(ruleKey, b.nextKeyword, b.title, { ruleKey, kind: 'button', index: bi });
    });
    (rule.listOptions || []).forEach((o, oi) => {
      addLink(ruleKey, o.nextKeyword, o.label, { ruleKey, kind: 'listOption', index: oi });
    });
  });

  function addLink(sourceKey, nextKeyword, label, link) {
    const edgeId = handleId(link.kind, link.ruleKey, link.index);
    const key = (nextKeyword || '').trim().toLowerCase();
    if (!key) return;
    const targetKey = keywordToRuleKey.get(key);
    if (targetKey) {
      layoutEdges.push({ source: sourceKey, target: targetKey });
      incomingTargets.add(targetKey);
      rfEdges.push({
        id: edgeId,
        source: sourceKey,
        target: targetKey,
        label,
        style: { stroke: 'var(--info-text)' },
      });
    } else {
      const ghostId = `ghost-${ghostCounter++}`;
      layoutNodes.push({ id: ghostId, width: GHOST_SIZE, height: GHOST_SIZE });
      layoutEdges.push({ source: sourceKey, target: ghostId });
      ghostNodes.push({
        id: ghostId,
        position: { x: 0, y: 0 },
        data: { label: '?', pendingLink: { ...link, targetKeyword: nextKeyword } },
        connectable: false,
        style: {
          width: GHOST_SIZE,
          height: GHOST_SIZE,
          borderRadius: '50%',
          border: '2px dashed var(--danger-text)',
          background: 'var(--danger-bg)',
          color: 'var(--danger-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
        },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      });
      rfEdges.push({
        id: edgeId,
        source: sourceKey,
        target: ghostId,
        label,
        style: { stroke: 'var(--danger-text)', strokeDasharray: '4 3' },
        labelStyle: { fill: 'var(--danger-text)' },
      });
    }
  }

  const positions = layout(layoutNodes, layoutEdges);

  const rfNodes = [];

  rules.forEach((rule, i) => {
    const ruleKey = getRuleKey(rule, i);
    const pos = positions.get(ruleKey);
    const orphan = !incomingTargets.has(ruleKey);
    rfNodes.push({
      id: ruleKey,
      type: 'ruleMessage',
      position: pos,
      data: { rule, ruleKey, orphan },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    });
  });

  ghostNodes.forEach((g) => {
    const pos = positions.get(g.id);
    rfNodes.push({ ...g, position: pos });
  });

  return { nodes: rfNodes, edges: rfEdges };
}
