<template>
  <div 
    class="fixed inset-0 left-0 top-0 bg-[#f0f2f5] flex flex-col z-[50]"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- Drag Overlay Indicator -->
    <div v-if="isDragging" class="absolute inset-0 z-[100] bg-[#008069]/10 backdrop-blur-sm border-4 border-dashed border-[#00a884] flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
       <div class="p-10 bg-white rounded-3xl shadow-2xl flex flex-col items-center gap-4">
          <PhotoIcon class="h-20 w-20 text-[#00a884] animate-bounce" />
          <h2 class="text-2xl font-medium text-[#111b21]">Drop image to share</h2>
       </div>
    </div>

    <div class="flex-1 flex overflow-hidden relative h-full">
      <!-- WhatsApp Sidebar -->
      <div 
        class="flex-shrink-0 border-r border-[#d1d7db] flex flex-col bg-white h-full transition-transform duration-300 z-40"
        :class="[
          selectedRoom && mobileView 
            ? 'w-0 overflow-hidden -translate-x-full' 
            : 'w-full md:w-[360px] translate-x-0'
        ]"
      >
        <!-- User Profile/Header -->
        <div class="px-4 py-3 bg-[#f0f2f5] flex items-center justify-between shrink-0">
          <div class="h-10 w-10 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
            <img v-if="user?.avatar" :src="user.avatar" class="h-full w-full object-cover" />
            <div v-else class="h-full w-full flex items-center justify-center text-gray-500">
              <UserIcon class="h-6 w-6" />
            </div>
          </div>
          <div class="flex items-center gap-1">
             <button @click="openNewChatModal" class="p-2 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors" title="New Chat">
               <PlusIcon class="h-6 w-6" />
             </button>
             <button @click="openNewGroupModal" class="p-2 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors" title="New Group">
               <UsersIcon class="h-6 w-6" />
             </button>
             <button class="p-2 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors">
               <EllipsisVerticalIcon class="h-6 w-6" />
             </button>
          </div>
        </div>

        <!-- Search -->
        <div class="p-2 bg-white shrink-0">
          <div class="relative flex items-center bg-[#f0f2f5] rounded-lg px-3">
            <MagnifyingGlassIcon class="h-4 w-4 text-[#54656f] shrink-0" />
            <input 
              type="text" 
              placeholder="Search or start new chat" 
              class="w-full bg-transparent border-none py-1.5 focus:ring-0 text-sm text-[#3b4a54] placeholder:text-[#8696a0]"
              v-model="searchQuery"
            />
          </div>
        </div>

        <!-- Room List -->
        <div class="flex-1 overflow-y-auto scrollbar-hide">
          <div v-if="loadingRooms" class="flex justify-center p-10">
            <div class="animate-spin h-6 w-6 border-2 border-[#00a884] border-t-transparent rounded-full" />
          </div>
          <div v-else-if="filteredRooms.length === 0" class="p-10 text-center text-[#667781] text-sm">No chats yet. Click + to start.</div>
          <div v-else>
            <div 
              v-for="room in filteredRooms" 
              :key="room._id"
              @click="selectRoom(room)"
              class="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-[#f5f6f6] border-b border-[#f0f2f5] transition-colors"
              :class="[selectedRoom?._id === room._id ? 'bg-[#ebebeb]' : '']"
            >
              <div class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                <img v-if="getRoomAvatar(room)" :src="getRoomAvatar(room)" class="h-full w-full object-cover" />
                <span v-else class="text-xl font-medium">{{ getRoomInitial(room) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-0.5">
                  <div class="flex items-center gap-1.5 mr-2 min-w-0">
                    <span v-if="room.type === 'support'" class="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md">Support</span>
                    <span class="text-[15px] font-normal text-[#111b21] truncate">{{ getRoomName(room) }}</span>
                  </div>
                  <span class="text-[11px] text-[#667781] shrink-0">{{ formatTimeShort(room.updatedAt) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <p class="text-[13px] text-[#667781] truncate flex-1 leading-tight">{{ room.lastMessage?.content || 'Click to chat' }}</p>
                  <div v-if="getUnreadCount(room) > 0" class="bg-[#25d366] text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0">{{ getUnreadCount(room) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WhatsApp Chat Window -->
      <div 
        class="flex-1 flex flex-col relative bg-[#efeae2] min-w-0"
        :class="[!selectedRoom && mobileView ? 'hidden' : 'flex']"
      >
        <!-- Doodle Background -->
        <div class="absolute inset-0 opacity-[0.06] pointer-events-none" style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-repeat: repeat;"></div>

        <template v-if="selectedRoom">
          <!-- Chat Header -->
          <div class="px-4 py-2.5 bg-[#f0f2f5] border-b border-[#d1d7db] flex items-center justify-between z-20 shrink-0">
            <div class="flex items-center gap-3">
              <button v-if="mobileView" @click="selectedRoom = null" class="mr-1 p-1 text-[#54656f]">
                <ArrowLeftIcon class="h-6 w-6" />
              </button>
              <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                 <img v-if="getRoomAvatar(selectedRoom)" :src="getRoomAvatar(selectedRoom)" class="h-full w-full object-cover" />
                 <span v-else class="text-lg font-medium">{{ getRoomInitial(selectedRoom) }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[15px] font-medium text-[#111b21] leading-tight">{{ getRoomName(selectedRoom) }}</span>
                <div class="flex items-center gap-2">
                    <span v-if="selectedRoom.currentStep" class="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{{ selectedRoom.currentStep }}</span>
                    <span v-if="isTyping" class="text-[11px] text-[#00a884] font-medium">{{ typingUser }} typing...</span>
                    <span v-else class="text-[11px] text-[#667781]">online</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
               <button class="p-2 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors"><MagnifyingGlassIcon class="h-5 w-5" /></button>
               <button class="p-2 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors"><EllipsisVerticalIcon class="h-5 w-5" /></button>
            </div>
          </div>

          <!-- Messages Container -->
          <div class="flex-1 overflow-y-auto px-[4%] md:px-[6%] py-6 flex flex-col gap-1.5 z-10 custom-scrollbar" ref="messageContainer">
            <template v-if="loadingMessages">
               <div class="flex justify-center py-20"><div class="animate-spin h-6 w-6 border-2 border-[#00a884] border-t-transparent rounded-full" /></div>
            </template>
            <template v-else>
              <div 
                v-for="(msg, index) in messages" 
                :key="msg._id || index"
                class="flex flex-col w-full relative"
                :class="[isMyMessage(msg) ? 'items-end' : isBotMessage(msg) ? 'items-start' : 'items-start']"
              >
                <!-- Date Marker -->
                <div v-if="shouldShowDate(index)" class="self-center my-4">
                  <div class="bg-white/90 px-3 py-1 rounded-md text-[11px] font-medium text-[#54656f] uppercase shadow-sm">{{ formatDateLabel(msg.createdAt) }}</div>
                </div>

                <!-- Bot Message -->
                <div v-if="isBotMessage(msg)" class="flex items-start gap-2 max-w-[85%] md:max-w-[65%]">
                  <div class="h-7 w-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-blue-600 mb-0.5 uppercase tracking-wider">🤖 Flybeth Bot</div>
                    <div class="relative px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-[#111b21] rounded-tl-none shadow-sm">
                      <p class="text-[14px] leading-normal break-words whitespace-pre-line" :class="msg.content.length > 20 ? 'pr-16' : 'pr-10'">{{ msg.content }}</p>
                      <div class="self-end flex items-center gap-1 mt-0.5 opacity-50"><span class="text-[9px]">{{ formatTimeOnly(msg.createdAt) }}</span></div>
                    </div>
                  </div>
                </div>

                <!-- Regular Message Bubble -->
                <div 
                  v-else
                  class="relative px-2 py-1.5 rounded-lg max-w-[85%] md:max-w-[65%] min-w-[100px] shadow-sm flex flex-col group/msg cursor-grab active:cursor-grabbing"
                  draggable="true"
                  @dragstart="handleMessageDragStart($event, msg)"
                  :class="[
                    isMyMessage(msg) ? 'bg-[#dcf8c6] text-[#111b21] rounded-tr-none' : 'bg-white text-[#111b21] rounded-tl-none'
                  ]"
                >
                  <!-- Tail -->
                  <div class="absolute top-0 w-3 h-3" :class="[isMyMessage(msg) ? 'right-[-6px] text-[#dcf8c6]' : 'left-[-6px] text-white']">
                     <svg viewBox="0 0 10 10" class="fill-current w-full h-full">
                       <path v-if="isMyMessage(msg)" d="M0 0 L10 0 L0 10 Z" />
                       <path v-else d="M0 0 L10 0 L10 10 Z" />
                     </svg>
                  </div>

                  <!-- Reply Context -->
                  <div v-if="msg.replyTo" class="mb-1.5 bg-black/5 rounded-md border-l-4 border-[#00a884] p-2 text-[12px] opacity-80 cursor-pointer" @click="scrollToMessage(msg.replyTo._id || msg.replyTo)">
                     <div class="font-bold text-[#00a884] mb-0.5">{{ getReplySenderName(msg.replyTo) }}</div>
                     <div class="truncate text-[#54656f]">{{ msg.replyTo.content }}</div>
                  </div>

                  <!-- Sender name for support/group chats -->
                  <div v-if="(selectedRoom.type === 'group' || selectedRoom.type === 'support') && !isMyMessage(msg)" class="text-[12px] font-medium text-[#00a884] mb-0.5">
                     {{ getSenderName(msg) }}
                  </div>

                  <div v-if="msg.type === 'image'" class="mb-1 rounded overflow-hidden">
                     <img :src="msg.content" class="max-w-full max-h-[400px] object-contain cursor-zoom-in" @click="openImage(msg.content)" />
                     <p v-if="msg.metadata?.caption" class="px-1 py-1.5 text-[14px] leading-normal">{{ msg.metadata.caption }}</p>
                  </div>
                  <p v-else class="text-[14px] leading-normal break-words pb-1" :class="msg.content.length > 20 ? 'pr-20' : 'pr-14'">{{ msg.content }}</p>
                  
                  <!-- Metadata -->
                  <div class="self-end flex items-center gap-1 mt-[-4px] opacity-60">
                    <span class="text-[9px]">{{ formatTimeOnly(msg.createdAt) }}</span>
                    <div v-if="isMyMessage(msg)" class="flex items-center -space-x-1">
                      <CheckIcon class="h-3 w-3" :class="isRead(msg) ? 'text-[#34b7f1]' : 'text-gray-400'" />
                      <CheckIcon v-if="isRead(msg)" class="h-3 w-3 text-[#34b7f1]" />
                    </div>
                  </div>

                  <!-- Reply Action Float -->
                  <div class="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity" :class="[isMyMessage(msg) ? 'left-[-40px]' : 'right-[-40px]']">
                     <button @click="setReply(msg)" class="p-2 hover:bg-black/10 rounded-full transition-colors text-[#54656f]">
                        <ArrowUturnLeftIcon class="h-5 w-5" />
                     </button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Attachment Preview Overlay -->
          <Transition name="fade">
            <div v-if="attachmentPreview" class="absolute inset-0 z-[60] bg-[#e9edef] flex flex-col">
               <div class="px-6 py-4 flex items-center gap-6 shrink-0 bg-white shadow-sm border-b border-[#d1d7db]">
                  <button @click="cancelAttachment" class="text-[#54656f] p-2 hover:bg-gray-100 rounded-full"><XMarkIcon class="h-6 w-6" /></button>
                  <span class="text-lg font-medium text-[#111b21]">Preview</span>
               </div>
               <div class="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
                  <img :src="attachmentPreviewUrl" class="max-h-full max-w-full object-contain shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-lg" />
               </div>
               <div class="p-6 bg-[#f0f2f5] flex flex-col gap-4 shrink-0 border-t border-[#d1d7db]">
                  <input v-model="attachmentCaption" type="text" placeholder="Add a caption..." class="w-full px-5 py-3.5 bg-white border-none rounded-xl text-[15px] focus:ring-0 text-[#3b4a54] shadow-sm" @keyup.enter="sendAttachment" />
                  <div class="flex justify-end items-center">
                     <button @click="sendAttachment" :disabled="uploading" class="h-14 w-14 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow-lg hover:brightness-110 disabled:opacity-50 transition-all">
                        <div v-if="uploading" class="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                        <PaperAirplaneIcon v-else class="h-6 w-6 rotate-45 ml-1" />
                     </button>
                  </div>
               </div>
            </div>
          </Transition>

          <!-- Input Area -->
          <div class="flex flex-col z-30 shrink-0 border-t border-[#d1d7db]">
            <!-- Reply Preview Bar -->
            <Transition name="slide-up">
              <div v-if="replyTo" class="bg-[#f0f2f5] px-4 pt-2 pb-0">
                 <div class="bg-white/80 rounded-lg border-l-4 border-[#00a884] p-3 flex justify-between gap-4">
                    <div class="flex-1 min-w-0">
                       <div class="text-[13px] font-bold text-[#00a884] mb-0.5">{{ getReplySenderName(replyTo) }}</div>
                       <div class="text-[13px] text-[#54656f] truncate">{{ replyTo.content }}</div>
                    </div>
                    <button @click="replyTo = null" class="text-[#54656f] hover:text-[#111b21] p-1"><XMarkIcon class="h-5 w-5" /></button>
                 </div>
              </div>
            </Transition>

            <div class="px-3 py-2.5 bg-[#f0f2f5] flex items-center gap-2">
               <div class="relative flex items-center shrink-0">
                  <button @click="toggleEmojiPicker" type="button" class="p-2 text-[#54656f] hover:text-[#00a884] transition-colors"><FaceSmileIcon class="h-6 w-6" /></button>
                  <div v-if="showEmojiPicker" class="absolute bottom-full mb-4 left-0 bg-white rounded-lg shadow-xl p-4 grid grid-cols-6 gap-2 w-72 z-[100] border border-[#d1d7db]">
                     <span v-for="emoji in popularEmojis" :key="emoji" @click="addEmoji(emoji)" class="text-2xl cursor-pointer hover:bg-gray-100 rounded p-1">{{ emoji }}</span>
                  </div>
                  <button @click="triggerFileUpload" type="button" class="p-2 text-[#54656f] hover:text-[#00a884] transition-colors"><PaperClipIcon class="h-6 w-6" /></button>
                  <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload" />
               </div>
               
               <div class="flex-1 min-w-0">
                 <input 
                   ref="messageInput"
                   type="text" 
                   v-model="newMessage"
                   @input="handleTyping"
                   @keyup.enter="sendMessage"
                   placeholder="Type a message" 
                   class="w-full px-4 py-2.5 bg-white border-none rounded-lg text-sm focus:ring-0 text-[#3b4a54] placeholder:text-[#8696a0]"
                   @drop.stop="handleDropReply"
                   @dragover.prevent
                 />
               </div>
               
               <button @click="sendMessage" :disabled="!newMessage.trim() && !uploading" class="p-2 shrink-0 text-[#54656f] hover:text-[#00a884] disabled:opacity-30 transition-all">
                 <component :is="newMessage.trim() ? PaperAirplaneIcon : MicroPhoneIcon" class="h-6 w-6" :class="{ 'rotate-45': newMessage.trim() }" />
               </button>
            </div>
          </div>
        </template>

        <!-- Placeholder Splash -->
        <div v-else class="flex-1 flex flex-col items-center justify-center p-12 bg-[#f8f9fa] z-10 border-b-[6px] border-[#00a884]">
           <div class="w-full max-w-lg space-y-8 flex flex-col items-center">
              <div class="h-48 w-48 bg-[#f5f6f6] rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon class="h-24 w-24 text-[#8696a0]/30" />
              </div>
              <div class="text-center space-y-4">
                 <h2 class="text-3xl font-light text-[#41525d]">WhatsApp for Web</h2>
                 <p class="text-sm text-[#667781] max-w-sm">Linked to your admin dashboard.</p>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <div v-if="showNewChatModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-[#f0f2f5]/90 backdrop-blur-sm" @click="showNewChatModal = false" />
        <div class="relative bg-white w-full max-w-md h-[85vh] flex flex-col shadow-2xl border border-[#d1d7db] rounded-lg overflow-hidden">
          <div class="p-4 bg-[#008069] text-white shrink-0 flex items-center gap-6">
             <button @click="showNewChatModal = false" class="p-1 hover:bg-black/10 rounded-full transition-colors"><ArrowLeftIcon class="h-6 w-6" /></button>
             <h3 class="text-lg font-medium">New Chat</h3>
          </div>
          <div class="p-2 bg-white shrink-0">
             <div class="flex items-center bg-[#f0f2f5] rounded-lg px-3 py-1">
                <MagnifyingGlassIcon class="h-4 w-4 text-[#54656f] shrink-0" />
                <input v-model="userSearchQuery" type="text" placeholder="Search contacts" class="w-full bg-transparent border-none py-1.5 focus:ring-0 text-sm" />
             </div>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar">
             <div v-for="u in filteredUsers" :key="u._id" @click="initiateChat(u)" class="flex items-center gap-4 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer border-b border-[#f0f2f5]">
                <div class="h-12 w-12 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <img v-if="u.avatar" :src="u.avatar" class="h-full w-full object-cover" />
                  <span v-else class="font-medium text-gray-400 text-lg">{{ u.firstName?.[0] }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-[15px] font-normal text-[#111b21] truncate">{{ u.firstName }} {{ u.lastName }}</h4>
                  <p class="text-[12px] text-[#667781] truncate">{{ u.role?.name || u.role }}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { 
  PlusIcon, MagnifyingGlassIcon, ChatBubbleBottomCenterTextIcon, ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon, PaperClipIcon, FaceSmileIcon, PaperAirplaneIcon, CheckIcon,
  UserIcon, MicrophoneIcon as MicroPhoneIcon, ArrowLeftIcon, UsersIcon, PhotoIcon,
  ChevronRightIcon, XMarkIcon, ArrowUturnLeftIcon
} from '@heroicons/vue/24/outline'
import { useAuth } from '@/composables/modules/auth/useAuth'
import { useRealtime } from '@/composables/core/useRealtime'
import { useUsers } from '@/composables/modules/users/useUsers'
import { useChat } from '@/composables/modules/chat/useChat'
import { adminApiFactory } from '@/api_factory/modules/admin'
import { useCustomToast } from '@/composables/core/useCustomToast'

const { user } = useAuth()
const { socket, connect } = useRealtime()
const { showToast } = useCustomToast()
const { fetchUsers, users, loading: loadingUsers } = useUsers()
const { 
  rooms, messages, loadingRooms, loadingMessages, fetchRooms: apiFetchRooms, 
  fetchMessages: apiFetchMessages, createRoom, createGroup
} = useChat()

const selectedRoom = ref<any>(null)
const searchQuery = ref('')
const userSearchQuery = ref('')
const newMessage = ref('')
const isTyping = ref(false)
const typingUser = ref('')
const showNewChatModal = ref(false)
const showNewGroupModal = ref(false)
const groupName = ref('')
const groupMembers = ref<any[]>([])
const creatingGroup = ref(false)
const messageContainer = ref<HTMLElement | null>(null)
const messageInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const showEmojiPicker = ref(false)
const mobileView = ref(false)
const isDragging = ref(false)

// Attachment & Reply State
const attachmentPreview = ref<File | null>(null)
const attachmentPreviewUrl = ref('')
const attachmentCaption = ref('')
const replyTo = ref<any>(null)

const popularEmojis = ['😀', '😂', '😍', '👍', '🙏', '🔥', '❤️', '🎉', '✈️', '💼', '✅', '❌']

const filteredRooms = computed(() => {
  if (!searchQuery.value) return rooms.value
  const q = searchQuery.value.toLowerCase()
  return rooms.value.filter(r => getRoomName(r).toLowerCase().includes(q))
})

const filteredUsers = computed(() => {
  const selfId = String(user.value?._id || user.value?.id || user.value?.sub)
  const baseList = users.value.filter(u => String(u._id) !== selfId)
  if (!userSearchQuery.value) return baseList
  const q = userSearchQuery.value.toLowerCase()
  return baseList.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
})

const updateView = () => mobileView.value = window.innerWidth < 768
onMounted(async () => {
  window.addEventListener('resize', updateView); updateView()
  connect(); await fetchRooms(); setupSocketListeners()
  if (users.value.length === 0) forceReloadUsers()
})
onUnmounted(() => window.removeEventListener('resize', updateView))

const forceReloadUsers = async () => { try { await fetchUsers({ page: 1, limit: 100 }) } catch (err) { console.error(err) } }

const BOT_USER_ID = '000000000000000000000001'
const isBotMessage = (msg: any) => {
  return msg.isBot || msg.isAutoResponse || msg.type === 'bot_response' || String(msg.sender?._id || msg.sender) === BOT_USER_ID || msg.metadata?.isBot
}

const setupSocketListeners = () => {
  if (!socket.value) return
  socket.value.on('newMessage', async (msg: any) => {
    const currentRoomId = String(selectedRoom.value?._id)
    const msgRoomId = String(msg.room?._id || msg.room)
    
    if (selectedRoom.value && msgRoomId === currentRoomId) {
      // Logic to replace optimistic message
      const tempIdx = messages.value.findIndex(m => 
        m._id?.toString().startsWith('temp-') && 
        m.content === msg.content &&
        Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 10000
      )

      if (tempIdx !== -1) {
        messages.value[tempIdx] = msg
      } else if (!messages.value.some(m => m._id === msg._id)) {
        messages.value.push(msg)
        nextTick(() => scrollToBottom())
      }
      markAsRead(currentRoomId)
    }


    const idx = rooms.value.findIndex(r => String(r._id) === msgRoomId)
    if (idx > -1) {
      const room = rooms.value[idx]; 
      room.lastMessage = msg; 
      room.updatedAt = new Date().toISOString()
      rooms.value.splice(idx, 1); 
      rooms.value.unshift(room)
    } else {
       console.log('[AdminChat] New message from unknown room, refreshing rooms list...')
       await apiFetchRooms({ page: 1, limit: 100 })
    }
  })

  socket.value.on('notification', (notif: any) => {
    console.log('[AdminChat] Received notification:', notif)
    if (notif.type === 'support_request') {
       apiFetchRooms({ page: 1, limit: 100 })
    }
  })

  socket.value.on('support_chat_update', async (data: any) => {
    console.log('[AdminChat] Support chat update:', data)
    // Aggressively refresh rooms so new support chats appear
    await apiFetchRooms({ page: 1, limit: 100 })
  })

  socket.value.on('user_typing', (data: any) => {
    const selfId = String(user.value?._id || user.value?.sub)
    if (selectedRoom.value && String(data.roomId) === String(selectedRoom.value._id) && String(data.userId) !== selfId) {
      isTyping.value = data.isTyping; typingUser.value = data.userName || 'Someone'
      if (isTyping.value) setTimeout(() => isTyping.value = false, 3000)
    }
  })

  socket.value.on('user_tracking_alert', (data: any) => {
    console.log('[AdminChat] User Tracking Alert:', data)
    const eventName = data.event.split('_').join(' ').toUpperCase()
    
    // Notify the admin with a premium toast
    showToast({
      title: "User Journey Alert",
      message: `${data.userId} is now at: ${eventName}`,
      toastType: "info"
    })

    // If we have rooms open, and this track matches a room's guest/user, we could update UI
    const matchingRoom = rooms.value.find(r => 
      (r.metadata?.guestIdentifier === data.userId) || 
      (r.participants?.some((p: any) => String(p?._id || p) === String(data.userId)))
    )
    
    if (matchingRoom) {
       matchingRoom.currentStep = eventName
       matchingRoom.lastActivity = new Date().toISOString()
    }
  })
}

const fetchRooms = async () => { try { await apiFetchRooms({ page: 1, limit: 100 }) } catch (err) { console.error(err) } }

const selectRoom = async (room: any) => {
  selectedRoom.value = room; if (socket.value) socket.value.emit('joinRoom', room._id)
  try { await apiFetchMessages(room._id, { page: 1, limit: 100 }); await nextTick(); scrollToBottom(); markAsRead(room._id) } catch (err) { console.error(err) }
}

const openNewChatModal = () => { showNewChatModal.value = true; userSearchQuery.value = '' }

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedRoom.value || !socket.value) return
  
  const content = newMessage.value
  const roomId = selectedRoom.value._id
  const payload = { roomId, content, type: 'text', replyTo: replyTo.value?._id }
  
  // Optimistic UI
  const tempId = `temp-${Date.now()}`
  const tempMsg = {
    _id: tempId,
    room: roomId,
    sender: { 
      _id: user.value?._id || user.value?.id || user.value?.sub, 
      firstName: user.value?.firstName, 
      lastName: user.value?.lastName 
    },
    content,
    type: 'text',
    createdAt: new Date().toISOString(),
    replyTo: replyTo.value,
    isOptimistic: true
  }
  
  messages.value.push(tempMsg)
  nextTick(() => scrollToBottom())

  newMessage.value = ''
  replyTo.value = null
  socket.value.emit('sendMessage', payload)
}

// Drag & Drop Replies
const handleMessageDragStart = (e: DragEvent, msg: any) => { e.dataTransfer?.setData('messageId', msg._id); e.dataTransfer!.effectAllowed = 'copy' }
const handleDropReply = (e: DragEvent) => {
  const msgId = e.dataTransfer?.getData('messageId')
  if (msgId) { const msg = messages.value.find(m => m._id === msgId); if (msg) setReply(msg) }
}
const setReply = (msg: any) => { replyTo.value = msg; nextTick(() => messageInput.value?.focus()) }

// Image Handling
const handleDragOver = () => { if (selectedRoom.value) isDragging.value = true }
const handleDragLeave = () => isDragging.value = false
const handleDrop = (e: DragEvent) => {
  isDragging.value = false; if (!selectedRoom.value) return
  const file = e.dataTransfer?.files[0]; if (file && file.type.startsWith('image/')) prepareAttachment(file)
}
const triggerFileUpload = () => fileInput.value?.click()
const handleFileUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]; if (file?.type.startsWith('image/')) prepareAttachment(file)
}
const prepareAttachment = (file: File) => { attachmentPreview.value = file; attachmentPreviewUrl.value = URL.createObjectURL(file); attachmentCaption.value = '' }
const cancelAttachment = () => { attachmentPreview.value = null; URL.revokeObjectURL(attachmentPreviewUrl.value); attachmentPreviewUrl.value = ''; attachmentCaption.value = '' }

const sendAttachment = async () => {
  if (!attachmentPreview.value || uploading.value || !selectedRoom.value || !socket.value) return
  uploading.value = true
  try {
    const formData = new FormData(); formData.append('file', attachmentPreview.value)
    const res = await adminApiFactory.uploadFile(formData)
    const imageUrl = res.data?.url || res.data?.secure_url
    if (imageUrl) {
       socket.value.emit('sendMessage', { roomId: selectedRoom.value._id, content: imageUrl, type: 'image', metadata: { caption: attachmentCaption.value }, replyTo: replyTo.value?._id })
       cancelAttachment(); replyTo.value = null
    }
  } catch (err) { console.error('Upload failed', err) } finally { uploading.value = false }
}

const toggleEmojiPicker = () => showEmojiPicker.value = !showEmojiPicker.value
const addEmoji = (emoji: string) => { newMessage.value += emoji; showEmojiPicker.value = false; messageInput.value?.focus() }

const initiateChat = async (participant: any) => {
   showNewChatModal.value = false
   try {
    const res = await createRoom(participant._id); const room = res?.data || res
    if (!rooms.value.some(r => r._id === room._id)) rooms.value.unshift(room); await selectRoom(room)
   } catch (err) { console.error(err) }
}

const handleTyping = () => { if (socket.value && selectedRoom.value) socket.value.emit('typing', { roomId: selectedRoom.value._id, isTyping: true, userName: user.value?.firstName }) }
const markAsRead = (roomId: string) => { if (socket.value) socket.value.emit('markAsRead', roomId) }
const scrollToBottom = () => { if (messageContainer.value) messageContainer.value.scrollTop = messageContainer.value.scrollHeight }
const scrollToMessage = (id: string) => { const el = document.querySelector(`[data-msg-id="${id}"]`); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }

const isMyMessage = (msg: any) => {
  if (isBotMessage(msg)) return false
  
  const senderId = String(msg.sender?._id || msg.sender)
  const myId = String(user.value?._id || user.value?.id || user.value?.sub || '')
  
  if (senderId && myId && senderId !== 'null' && senderId !== 'undefined' && senderId === myId) {
    return true
  }

  // Fallback for support roles if ID comparison fails for some reason
  if (msg.metadata?.senderRole && ['super_admin', 'admin', 'staff'].includes(msg.metadata.senderRole)) {
     // If we are an admin and the message is from an admin, it's likely ours in a 1-on-1 support chat
     // But to be safe, also check the email if available in metadata
     if (msg.metadata?.senderEmail === user.value?.email) return true
  }

  return false
}
const isRead = (msg: any) => msg.readBy?.length > 1
const getRoomName = (room: any) => {
  if (room.type === 'group') return room.name
  if (room.type === 'support') return room.metadata?.guestName || room.metadata?.userName || room.name || 'Support Chat'
  const selfId = String(user.value?._id || user.value?.sub || user.value?.id)
  const other = room.participants?.find((p: any) => String(p?._id || p) !== selfId)
  if (other?.firstName) return `${other.firstName} ${other.lastName}`
  const found = users.value.find(u => String(u._id) === String(other?._id || other))
  return found ? `${found.firstName} ${found.lastName}` : (other?.email || room.metadata?.guestEmail || 'Unknown User')
}
const getSenderName = (msg: any) => {
  if (isBotMessage(msg)) return '🤖 Bot'
  if (msg.metadata?.userName) return msg.metadata.userName
  return msg.sender?.firstName ? `${msg.sender.firstName} ${msg.sender.lastName}` : (msg.metadata?.guestIdentifier || 'Participant')
}
const getReplySenderName = (msg: any) => {
   if (String(msg.sender?._id || msg.sender) === String(user.value?._id || user.value?.sub)) return 'You'
   return msg.sender?.firstName ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Participant'
}
const getRoomAvatar = (room: any) => {
  const selfId = String(user.value?._id || user.value?.sub)
  return room.participants?.find((p: any) => String(p?._id || p) !== selfId)?.avatar
}
const getRoomInitial = (room: any) => (room.type === 'group' ? (room.name?.[0] || 'G') : (getRoomName(room)?.[0] || '?'))
const getUnreadCount = (room: any) => 0
const formatTimeShort = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
const formatTimeOnly = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''
const shouldShowDate = (index: number) => index === 0 || new Date(messages.value[index].createdAt).toDateString() !== new Date(messages.value[index - 1].createdAt).toDateString()
const formatDateLabel = (date: string) => new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
const openImage = (url: string) => window.open(url, '_blank')

watch(rooms, () => {
  const missing = rooms.value.flatMap(r => r.participants || []).filter(p => {
    const pId = String(p?._id || p); return pId !== String(user.value?._id || user.value?.sub) && !users.value.some(u => String(u._id) === pId)
  }); if (missing.length > 0) forceReloadUsers()
}, { immediate: true })
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.2s ease-out; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(10px); opacity: 0; }
</style>
