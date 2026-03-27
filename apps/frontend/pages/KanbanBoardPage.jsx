"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  X,
  Send,
} from "lucide-react";
import AddCardModal from "./AddCardModal";
import { projects as allProjects } from "@/lib/projects";

const KanbanBoardPage = () => {
  const params = useParams();
  const pid = decodeURIComponent((params?.pid || "").toString());
  const project = useMemo(
    () => allProjects.find((item) => item.pid === pid),
    [pid]
  );

  const [columns, setColumns] = useState([
    {
      id: "todo",
      title: "To Do",
      count: 2,
      cards: [
        {
          id: "card-1",
          title: "Design System Update",
          tag: "High",
          tagColor: "bg-red-100 text-red-700",
          description:
            "Update the design system with new color palette and typography guidelines",
          date: "Mar 15",
          comments: 3,
          commentsData: [
            { id: "c1", user: "Manager", text: "Please update the colors", time: "10:15 AM" },
            { id: "c2", user: "Dev", text: "I will do it today", time: "10:20 AM" },
            { id: "c3", user: "QA", text: "Add accessibility contrast check", time: "10:25 AM" },
          ],
          attachments: 2,
          attachmentsData: [],
        },
        {
          id: "card-2",
          title: "Mobile Optimization",
          tag: "Medium",
          tagColor: "bg-yellow-100 text-yellow-700",
          description: "Optimize application performance for mobile devices",
          date: "Mar 22",
          comments: 1,
          commentsData: [{ id: "c1", user: "Dev", text: "Started performance profiling", time: "9:10 AM" }],
          attachments: 3,
          attachmentsData: [],
        },
      ],
    },
    {
      id: "inprogress",
      title: "In Progress",
      count: 2,
      cards: [
        {
          id: "card-3",
          title: "API Integration",
          tag: "High",
          tagColor: "bg-red-100 text-red-700",
          description: "Integrate third-party payment API for checkout process",
          date: "Mar 15",
          comments: 0,
          commentsData: [],
          attachments: 1,
          attachmentsData: [],
        },
        {
          id: "card-4",
          title: "User Research",
          tag: "Medium",
          tagColor: "bg-yellow-100 text-yellow-700",
          description: "Conduct user interviews for new feature validation",
          date: "Mar 20",
          comments: 0,
          commentsData: [],
          attachments: 0,
          attachmentsData: [],
        },
      ],
    },
    {
      id: "review",
      title: "Review",
      count: 3,
      cards: [
        {
          id: "card-5",
          title: "Documentation Update",
          tag: "Low",
          tagColor: "bg-green-100 text-green-700",
          description: "Update technical documentation for API endpoints",
          date: "Mar 18",
          comments: 0,
          commentsData: [],
          attachments: 1,
          attachmentsData: [],
        },
        {
          id: "card-6",
          title: "Documentation Update",
          tag: "High",
          tagColor: "bg-red-100 text-red-700",
          description: "Fix authentication error on mobile devices",
          date: "Mar 16",
          comments: 0,
          commentsData: [],
          attachments: 1,
          attachmentsData: [],
        },
        {
          id: "card-7",
          title: "User Research",
          tag: "Medium",
          tagColor: "bg-yellow-100 text-yellow-700",
          description: "Conduct user interviews for new feature validation",
          date: "Mar 20",
          comments: 0,
          commentsData: [],
          attachments: 0,
          attachmentsData: [],
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      count: 2,
      cards: [
        {
          id: "card-8",
          title: "Dashboard Analytics",
          tag: "Medium",
          tagColor: "bg-yellow-100 text-yellow-700",
          description: "Implement new analytics dashboard with real-time data",
          date: "Mar 25",
          comments: 0,
          commentsData: [],
          attachments: 2,
          attachmentsData: [],
        },
        {
          id: "card-9",
          title: "Dashboard Analytics",
          tag: "High",
          tagColor: "bg-red-100 text-red-700",
          description: "Perform comprehensive security audit of the application",
          date: "Mar 10",
          comments: 0,
          commentsData: [],
          attachments: 5,
          attachmentsData: [],
        },
      ],
    },
  ]);

  const storageKey = `kanban_columns_${pid || "default"}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setColumns(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      const toSave = columns.map((col) => ({
        ...col,
        count: col.cards?.length || 0,
      }));
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch {}
  }, [columns, storageKey]);

  // ----- Add Card Modal -----
  const [openFormColumnId, setOpenFormColumnId] = useState(null);
  const [newCardData, setNewCardData] = useState({
    title: "",
    tag: "",
    description: "",
  });

  const openForm = (columnId) => {
    setOpenFormColumnId(columnId);
    setNewCardData({
      title: "",
      tag: "High",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      attachments: [],
      status: columnId,
      assignee: "",
    });
  };

  const closeForm = () => {
    setOpenFormColumnId(null);
    setNewCardData({ title: "", tag: "", description: "" });
  };

  const handleFormSubmit = (columnId, formData) => {
    const data = formData || newCardData;
    if (!data.title?.trim()) return;

    const newCard = {
      id: `card-${Date.now()}`,
      title: data.title,
      tag: data.tag || "Medium",
      tagColor:
        data.tag === "High"
          ? "bg-red-100 text-red-700"
          : data.tag === "Low"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700",
      description: data.description || "",
      date: data.date
        ? new Date(data.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
      comments: 0,
      commentsData: [],
      attachments: data.attachments?.length ? data.attachments.length : 0,
      attachmentsData: data.attachments || [],
    };

    setColumns((cols) =>
      cols.map((col) =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, newCard], count: (col.cards?.length || 0) + 1 }
          : col
      )
    );

    closeForm();
  };

  // ----- Board drag scroll -----
  const boardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    // don't start drag when clicking on cards/buttons/inputs
    if (
      e.target.closest(".kanban-card") ||
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest("textarea")
    )
      return;

    setIsDragging(true);
    setStartX(e.pageX - boardRef.current.offsetLeft);
    setScrollLeft(boardRef.current.scrollLeft);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - boardRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    boardRef.current.scrollLeft = scrollLeft - walk;
  };

  // ----- 3 dots menu -----
  const [openMenu, setOpenMenu] = useState({ columnId: null, cardId: null });

  // ✅ close menu when click outside
  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (!e.target.closest(".menu-btn") && !e.target.closest(".menu-popup")) {
        setOpenMenu({ columnId: null, cardId: null });
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const handleDeleteCard = (columnId, cardId) => {
    setColumns((cols) =>
      cols.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.filter((c) => c.id !== cardId),
              count: Math.max(0, (col.cards?.length || 1) - 1),
            }
          : col
      )
    );
  };

  const getColumnDotClass = (colId) => {
    switch (colId) {
      case "todo":
        return "bg-gray-400";
      case "inprogress":
        return "bg-yellow-400";
      case "review":
        return "bg-blue-400";
      case "done":
        return "bg-green-400";
      default:
        return "bg-gray-300";
    }
  };

  // ----- Comments Modal -----
  const [openComments, setOpenComments] = useState(null); // { columnId, cardId }
  const [commentText, setCommentText] = useState("");

  const getCardByIds = (columnId, cardId) => {
    const col = columns.find((c) => c.id === columnId);
    if (!col) return null;
    return col.cards.find((c) => c.id === cardId) || null;
  };

  const openCommentsModal = (columnId, cardId) => {
    setOpenComments({ columnId, cardId });
    setCommentText("");
  };

  const closeCommentsModal = () => {
    setOpenComments(null);
    setCommentText("");
  };

  const formatTime = (d = new Date()) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text || !openComments) return;

    const { columnId, cardId } = openComments;

    const newMsg = {
      id: `m-${Date.now()}`,
      user: "You",
      text,
      time: formatTime(),
    };

    setColumns((cols) =>
      cols.map((col) => {
        if (col.id !== columnId) return col;

        return {
          ...col,
          cards: col.cards.map((card) => {
            if (card.id !== cardId) return card;

            const list = Array.isArray(card.commentsData) ? card.commentsData : [];
            const updated = [...list, newMsg];

            return {
              ...card,
              commentsData: updated,
              comments: updated.length,
            };
          }),
        };
      })
    );

    setCommentText("");
  };

  const openedCard = openComments
    ? getCardByIds(openComments.columnId, openComments.cardId)
    : null;

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Welcome, back to Kanban Board!</p>
          <h2 className="text-2xl font-bold text-gray-800">
            {project?.name || "Smart Task Allocation and Tracking System"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track your team's tasks</p>
        </div>

        <div
          ref={boardRef}
          className="flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="flex gap-6 h-full min-w-max pb-4">
            {columns.map((column) => (
              <div
                key={column.id}
                className="w-80 flex-shrink-0 bg-gray-100 rounded-xl flex flex-col max-h-full"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getColumnDotClass(column.id)}`} />
                    <h3 className="font-semibold text-gray-700">{column.title}</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                      {column.count}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openForm(column.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Add ticket"
                  >
                    <Plus className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {column.cards.map((card) => (
                    <div
                      key={card.id}
                      className="kanban-card bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setOpenMenu({ columnId: null, cardId: null })}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-800 text-sm">{card.title}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.tagColor}`}>
                          {card.tag}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{card.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="w-3 h-3" />
                            <span>{card.date}</span>
                          </div>

                          {/* message icon */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCommentsModal(column.id, card.id);
                            }}
                            className="flex items-center gap-1 text-xs hover:text-indigo-600 transition-colors"
                            title="Ticket messages"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{card.comments || 0}</span>
                          </button>

                          <div className="flex items-center gap-1 text-xs">
                            <Paperclip className="w-3 h-3" />
                            <span>{card.attachments || 0}</span>
                          </div>
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            className="menu-btn p-1 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu((prev) =>
                                prev.cardId === card.id && prev.columnId === column.id
                                  ? { columnId: null, cardId: null }
                                  : { columnId: column.id, cardId: card.id }
                              );
                            }}
                            title="More"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>

                          {openMenu.cardId === card.id && openMenu.columnId === column.id && (
                            <div className="menu-popup absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow z-10 text-sm">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm("Delete this card?")) {
                                    handleDeleteCard(column.id, card.id);
                                  }
                                  setOpenMenu({ columnId: null, cardId: null });
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <AddCardModal
          show={openFormColumnId !== null}
          initialData={newCardData}
          onCancel={closeForm}
          onSave={(data) => handleFormSubmit(openFormColumnId, data)}
        />

        {/* Comments popup */}
        {openComments && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onMouseDown={(e) => {
                e.stopPropagation();
                closeCommentsModal();
              }}
            />

            <div
              className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b">
                <div>
                  <h3 className="font-semibold text-gray-800">Ticket Messages</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{openedCard?.title || ""}</p>
                </div>
                <button
                  type="button"
                  onClick={closeCommentsModal}
                  className="p-2 rounded-lg hover:bg-white"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="p-5">
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                  {openedCard?.commentsData?.length ? (
                    openedCard.commentsData.map((m) => (
                      <div key={m.id} className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                          {(m.user || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-800">{m.user}</p>
                            <p className="text-xs text-gray-400">{m.time}</p>
                          </div>
                          <div className="mt-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">
                            {m.text}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No messages yet. Add the first message.</p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendComment();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendComment}
                    className="h-11 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default KanbanBoardPage;


