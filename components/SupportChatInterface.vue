<template>
  <div 
    :class="[isFullScreen ? 'fixed inset-0 z-[100] w-screen h-screen' : 'absolute inset-0 z-[50]', 'bg-[#f0f2f5] flex flex-col']"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- Drag Overlay Indicator -->
    <div v-if="isDragging" class="absolute inset-0 z-[100] bg-[#008069]/10 backdrop-blur-sm border-4 border-dashed border-[#00a884] flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
       <div class="p-10 bg-white rounded-3xl shadow-none flex flex-col items-center gap-4">
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
             <button @click="isFullScreen = !isFullScreen" class="p-2 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors" :title="isFullScreen ? 'Exit Full Screen' : 'Full Screen'">
               <component :is="isFullScreen ? ArrowsPointingInIcon : ArrowsPointingOutIcon" class="h-6 w-6" />
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
                    <span v-if="room.type === 'support'" class="shrink-0 text-[9px] font-bold uppercase  bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md">Support</span>
                    <span class="text-[15px] font-medium text-[#111b21] truncate">{{ getRoomName(room) }}</span>
                  </div>
                  <span class="text-[11px] font-medium text-[#3b4a54] shrink-0">{{ formatTimeShort(room.updatedAt) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <p class="text-[13px] font-medium text-[#3b4a54] truncate flex-1 leading-tight">{{ room.lastMessage?.content || 'Click to chat' }}</p>
                  <div v-if="getUnreadCount(room) > 0" class="bg-[#25d366] text-white text-sm font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0">{{ getUnreadCount(room) }}</div>
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
                <span class="text-[15px] font-bold text-[#111b21] leading-tight">{{ getRoomName(selectedRoom) }}</span>
                <div class="flex items-center gap-2">
                    <span v-if="selectedRoom.type === 'support'" class="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">{{ formatDepartment(selectedRoom.department) }}</span>
                    <span v-if="selectedRoom.currentStep" class="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase ">{{ selectedRoom.currentStep }}</span>
                    <span v-if="isTyping" class="text-[11px] text-[#00a884] font-medium">{{ typingUser }} typing...</span>
                    <span v-else-if="selectedRoom.status === 'resolved'" class="text-[11px] text-green-600 font-bold">Resolved ({{ selectedRoom.ticketNumber }})</span>
                    <span v-else class="text-[11px] font-medium text-[#3b4a54]">online</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
               <button v-if="selectedRoom.type === 'support' && selectedRoom.status !== 'resolved'" @click="showTransferModal = true" class="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md transition-colors font-medium">Transfer</button>
               <button v-if="selectedRoom.type === 'support' && selectedRoom.status !== 'resolved'" @click="resolveModalOpen = true" class="px-3 py-1.5 text-sm bg-[#00a884] text-white hover:bg-[#008f6f] rounded-md transition-colors font-medium">Resolve</button>
               <button @click="showChatSearch = !showChatSearch" class="p-2 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors"><MagnifyingGlassIcon class="h-5 w-5" /></button>
               <button @click="isFullScreen = !isFullScreen" class="p-2 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors" :title="isFullScreen ? 'Exit Full Screen' : 'Full Screen'">
                 <component :is="isFullScreen ? ArrowsPointingInIcon : ArrowsPointingOutIcon" class="h-5 w-5" />
               </button>
               <button @click="handleAction('menu')" class="p-2 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors"><EllipsisVerticalIcon class="h-5 w-5" /></button>
            </div>
          </div>

          <!-- Chat Search Bar -->
          <Transition name="fade">
            <div v-if="showChatSearch" class="bg-white border-b border-[#d1d7db] px-4 py-2 flex items-center gap-2 shadow-sm z-20">
              <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
              <input v-model="chatSearchQuery" type="text" placeholder="Search messages in chat..." class="flex-1 border-none focus:ring-0 text-sm py-1 bg-transparent" />
              <button @click="showChatSearch = false; chatSearchQuery = ''" class="p-1 text-gray-400 hover:text-gray-600"><XMarkIcon class="h-5 w-5" /></button>
            </div>
          </Transition>

          <!-- Messages Container -->
          <div class="flex-1 overflow-y-auto px-[4%] md:px-[6%] py-6 flex flex-col gap-1.5 z-10 custom-scrollbar" ref="messageContainer">
            <template v-if="loadingMessages">
               <div class="flex justify-center py-20"><div class="animate-spin h-6 w-6 border-2 border-[#00a884] border-t-transparent rounded-full" /></div>
            </template>
            <template v-else>
              <div 
                v-for="(msg, index) in filteredChatMessages" 
                :key="msg._id || index"
                class="flex flex-col w-full relative"
                :class="[isMyMessage(msg) ? 'items-end' : isBotMessage(msg) ? 'items-start' : 'items-start']"
              >
                <!-- Date Marker -->
                <div v-if="shouldShowDate(index)" class="self-center my-4">
                  <div class="bg-white/90 px-3 py-1 rounded-md text-[11px] font-medium text-[#54656f] uppercase shadow-none">{{ formatDateLabel(msg.createdAt) }}</div>
                </div>

                <!-- Bot Message -->
                <div v-if="isBotMessage(msg)" class="flex items-start gap-2 max-w-[85%] md:max-w-[65%]">
                  <div class="h-7 w-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-blue-600 mb-0.5 uppercase ">🤖 Flybeth Bot</div>
                    <div class="relative px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-[#111b21] rounded-tl-none shadow-none">
                      <p class="text-[15px] font-semibold leading-normal break-words whitespace-pre-line" :class="msg.content.length > 20 ? 'pr-16' : 'pr-10'">{{ msg.content }}</p>
                      <div class="self-end flex items-center gap-1 mt-0.5 opacity-50"><span class="text-[9px]">{{ formatTimeOnly(msg.createdAt) }}</span></div>
                    </div>
                  </div>
                </div>

                <!-- Regular Message Bubble -->
                <div 
                  v-else
                  class="relative px-2 py-1.5 rounded-lg max-w-[85%] md:max-w-[65%] min-w-[100px] shadow-none flex flex-col group/msg cursor-grab active:cursor-grabbing"
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
                     <img :src="msg.metadata?.imageUrl || msg.content" class="max-w-full max-h-[400px] object-contain cursor-zoom-in" @click="openImage(msg.metadata?.imageUrl || msg.content)" />
                     <p v-if="msg.metadata?.caption || (msg.metadata?.imageUrl && msg.content && msg.content !== msg.metadata?.imageUrl && msg.content !== 'Image')" class="px-1 py-1.5 text-[15px] font-semibold leading-normal">{{ msg.metadata?.caption || msg.content }}</p>
                  </div>
                  <p v-else class="text-[15px] font-semibold leading-normal break-words pb-1" :class="msg.content.length > 20 ? 'pr-20' : 'pr-14'">{{ msg.content }}</p>
                  
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
               <div class="px-6 py-4 flex items-center gap-6 shrink-0 bg-white shadow-none border-b border-[#d1d7db]">
                  <button @click="cancelAttachment" class="text-[#54656f] p-2 hover:bg-gray-100 rounded-full"><XMarkIcon class="h-6 w-6" /></button>
                  <span class="text-lg font-medium text-[#111b21]">Preview</span>
               </div>
               <div class="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
                  <img :src="attachmentPreviewUrl" class="max-h-full max-w-full object-contain shadow-none rounded-lg" />
               </div>
               <div class="p-6 bg-[#f0f2f5] flex flex-col gap-4 shrink-0 border-t border-[#d1d7db]">
                  <input v-model="attachmentCaption" type="text" placeholder="Add a caption..." class="w-full px-5 py-3.5 bg-white border-none rounded-xl text-[15px] focus:ring-0 text-[#3b4a54] shadow-none" @keyup.enter="sendAttachment" />
                  <div class="flex justify-end items-center">
                     <button @click="sendAttachment" :disabled="uploading" class="h-14 w-14 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow-none hover:brightness-110 disabled:opacity-50 transition-all">
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
                  <div v-if="showEmojiPicker" class="absolute bottom-full left-4 z-50 mb-2 shadow-xl border border-gray-200 rounded-lg bg-white p-2">
                     <div class="flex flex-wrap gap-1 max-w-[200px]">
                        <button v-for="emoji in popularEmojis" :key="emoji" @click="onSelectEmoji({i: emoji})" class="p-1.5 hover:bg-gray-100 rounded text-xl">{{ emoji }}</button>
                     </div>
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

          <!-- Transfer Modal -->
          <div v-if="showTransferModal" class="absolute inset-0 z-[100] bg-black/50 flex items-center justify-center">
             <div class="bg-white rounded-xl shadow-2xl w-[90%] max-w-sm p-6">
                <h3 class="text-xl font-bold text-[#111b21] mb-2">Transfer Chat</h3>
                <p class="text-sm text-[#54656f] mb-4">Select the department you want to route this chat to.</p>
                <select v-model="transferDepartment" class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] text-[#3b4a54] mb-6">
                   <option disabled value="">Choose department...</option>
                   <option v-for="dept in departments" :key="dept.slug" :value="dept.slug">{{ dept.name }}</option>
                </select>
                <div class="flex justify-end gap-3">
                   <button @click="showTransferModal = false" class="px-4 py-2 text-[#54656f] font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                   <button @click="transferChat" :disabled="!transferDepartment" class="px-4 py-2 bg-[#00a884] text-white font-medium hover:bg-[#008f6f] rounded-lg disabled:opacity-50">Transfer</button>
                </div>
             </div>
          </div>

          <!-- Resolve Modal -->
          <div v-if="resolveModalOpen" class="absolute inset-0 z-[100] bg-black/50 flex items-center justify-center">
             <div class="bg-white rounded-xl shadow-2xl w-[90%] max-w-sm p-6">
                <h3 class="text-xl font-bold text-[#111b21] mb-2">Resolve Support Chat</h3>
                <p class="text-sm text-[#54656f] mb-6">Are you sure this issue has been resolved? The chat will be closed and the user will be emailed a ticket number.</p>
                <div class="flex justify-end gap-3">
                   <button @click="resolveModalOpen = false" class="px-4 py-2 text-[#54656f] font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                   <button @click="resolveChat" class="px-4 py-2 bg-red-500 text-white font-medium hover:bg-red-600 rounded-lg">Confirm Resolution</button>
                </div>
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
        <div class="relative bg-white w-full max-w-md h-[85vh] flex flex-col shadow-none border border-[#d1d7db] rounded-lg overflow-hidden">
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
                  <h4 class="text-[15px] font-medium text-[#111b21] truncate">{{ u.firstName }} {{ u.lastName }}</h4>
                  <p class="text-[12px] text-[#3b4a54] font-medium truncate">{{ u.role?.name || u.role }}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div v-if="showNewGroupModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-[#f0f2f5]/90 backdrop-blur-sm" @click="showNewGroupModal = false" />
        <div class="relative bg-white w-full max-w-md h-[85vh] flex flex-col shadow-none border border-[#d1d7db] rounded-lg overflow-hidden">
          <div class="p-4 bg-[#008069] text-white shrink-0 flex items-center gap-6">
             <button @click="showNewGroupModal = false" class="p-1 hover:bg-black/10 rounded-full transition-colors"><ArrowLeftIcon class="h-6 w-6" /></button>
             <h3 class="text-lg font-medium">New Group</h3>
          </div>
          <div class="p-4 bg-[#f0f2f5] shrink-0 border-b border-[#d1d7db]">
             <input v-model="groupName" type="text" placeholder="Group Subject" class="w-full bg-white border border-[#d1d7db] px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] text-sm font-medium" />
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
             <div v-for="u in filteredUsers" :key="u._id" @click="toggleGroupMember(u)" class="flex items-center gap-4 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer border-b border-[#f0f2f5] rounded-lg transition-colors">
                <input type="checkbox" :checked="groupMembers.some(m => m._id === u._id)" class="rounded border-gray-300 text-[#00a884] focus:ring-[#00a884]" />
                <div class="h-10 w-10 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <img v-if="u.avatar" :src="u.avatar" class="h-full w-full object-cover" />
                  <span v-else class="font-medium text-gray-400 text-lg">{{ u.firstName?.[0] }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-[14px] font-medium text-[#111b21] truncate">{{ u.firstName }} {{ u.lastName }}</h4>
                </div>
             </div>
          </div>
          <div class="p-4 bg-white shrink-0 flex justify-end items-center gap-3 border-t border-[#d1d7db]">
             <button @click="showNewGroupModal = false" class="px-4 py-2 text-[#54656f] font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
             <button @click="submitGroup" :disabled="!groupName.trim() || groupMembers.length === 0 || creatingGroup" class="px-4 py-2 bg-[#00a884] text-white font-medium hover:bg-[#008f6f] rounded-lg disabled:opacity-50">
               {{ creatingGroup ? 'Creating...' : 'Create' }}
             </button>
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
  ChevronRightIcon, XMarkIcon, ArrowUturnLeftIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon
} from '@heroicons/vue/24/outline'
import { useAuth } from '@/composables/modules/auth/useAuth'
import { useRealtime } from '@/composables/core/useRealtime'
import { useUsers } from '@/composables/modules/users/useUsers'
import { useChat } from '@/composables/modules/chat/useChat'
import { adminApiFactory } from '@/api_factory/modules/admin'
import { departmentApiFactory } from '@/api_factory/modules/department'
import { useCustomToast } from '@/composables/core/useCustomToast'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const { user } = useAuth()
const { socket, connect } = useRealtime()
const { showToast } = useCustomToast()
const { fetchUsers, users, loading: loadingUsers } = useUsers()
const { 
  rooms, messages, loadingRooms, loadingMessages, fetchSupportRooms: apiFetchRooms, 
  fetchMessages: apiFetchMessages, createRoom, createGroup, resolveSupportRoom
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
const isFullScreen = ref(false)
const showChatSearch = ref(false)
const chatSearchQuery = ref('')

// Action Handlers
const handleAction = (action: string) => {
  if (action === 'search') {
    showToast({ title: 'Search', message: 'Chat search functionality coming soon!', toastType: 'info' })
  } else if (action === 'menu') {
    showToast({ title: 'Menu', message: 'Additional menu options coming soon!', toastType: 'info' })
  }
}

// Attachment & Reply State
const attachmentPreview = ref<File | null>(null)
const attachmentPreviewUrl = ref('')
const attachmentCaption = ref('')
const replyTo = ref<any>(null)

const departments = ref<any[]>([])
const transferDepartment = ref('')
const showTransferModal = ref(false)
const resolveModalOpen = ref(false)

const formatDepartment = (dept: string) => {
  if (!dept) return 'General'
  const found = departments.value.find(d => d.slug === dept)
  if (found) return found.name
  return dept.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const transferChat = () => {
  if (!socket.value || !selectedRoom.value || !transferDepartment.value) return
  socket.value.emit('transferRoom', { roomId: selectedRoom.value._id, department: transferDepartment.value })
  showTransferModal.value = false
  transferDepartment.value = ''
  showToast({ title: 'Transfer Initiated', message: 'Chat is being routed to the selected department.', toastType: 'success' })
}

const resolveChat = async () => {
  if (!selectedRoom.value) return
  
  try {
    const res = await resolveSupportRoom(selectedRoom.value._id)
    resolveModalOpen.value = false
    
    // Optimsitically update the UI
    selectedRoom.value.status = 'resolved'
    selectedRoom.value.ticketNumber = res?.ticketNumber || 'TKT-PENDING'
    
    const idx = rooms.value.findIndex(r => String(r._id) === selectedRoom.value._id)
    if (idx > -1) {
      rooms.value[idx].status = 'resolved'
      rooms.value[idx].ticketNumber = res?.ticketNumber || 'TKT-PENDING'
    }
    
    showToast({ title: 'Chat Resolved', message: 'Ticket has been generated and email sent.', toastType: 'success' })
  } catch (err) {
    showToast({ title: 'Error', message: 'Failed to resolve chat.', toastType: 'error' })
  }
}

const popularEmojis = ['😀', '😂', '😍', '👍', '🙏', '🔥', '❤️', '🎉', '✈️', '💼', '✅', '❌']

const filteredRooms = computed(() => {
  let list = rooms.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r => getRoomName(r).toLowerCase().includes(q) || (r.lastMessage?.content || '').toLowerCase().includes(q))
  }
  return list
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
  await loadDepartments()
  if (users.value.length === 0) forceReloadUsers()
})

const loadDepartments = async () => {
  try {
    const res = await departmentApiFactory.getDepartments()
    departments.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load departments')
  }
}

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

  socket.value.on('roomTransferred', (data: any) => {
    if (selectedRoom.value && selectedRoom.value._id === data.roomId) {
      selectedRoom.value.department = data.department
    }
    const idx = rooms.value.findIndex(r => String(r._id) === data.roomId)
    if (idx > -1) {
      rooms.value[idx].department = data.department
    }
  })

  socket.value.on('roomResolved', (data: any) => {
    if (selectedRoom.value && selectedRoom.value._id === data.roomId) {
      selectedRoom.value.status = 'resolved'
      selectedRoom.value.ticketNumber = data.ticketNumber
    }
    const idx = rooms.value.findIndex(r => String(r._id) === data.roomId)
    if (idx > -1) {
      rooms.value[idx].status = 'resolved'
      rooms.value[idx].ticketNumber = data.ticketNumber
    }
    showToast({ title: 'Chat Resolved', message: `Ticket #${data.ticketNumber} generated.`, toastType: 'success' })
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
const openNewGroupModal = () => { showNewGroupModal.value = true; userSearchQuery.value = ''; groupName.value = ''; groupMembers.value = [] }

const toggleGroupMember = (user: any) => {
  const idx = groupMembers.value.findIndex(m => m._id === user._id)
  if (idx > -1) groupMembers.value.splice(idx, 1)
  else groupMembers.value.push(user)
}

const submitGroup = async () => {
  if (!groupName.value.trim() || groupMembers.value.length === 0) return
  creatingGroup.value = true
  try {
    const payload = {
      name: groupName.value.trim(),
      participantIds: groupMembers.value.map(m => m._id)
    }
    const res = await createGroup(payload)
    const room = res?.data || res
    if (room) {
      if (!rooms.value.some(r => r._id === room._id)) rooms.value.unshift(room)
      await selectRoom(room)
    }
    showNewGroupModal.value = false
    showToast({ title: 'Group Created', message: 'Group chat created successfully.', toastType: 'success' })
  } catch (err) {
    console.error(err)
    showToast({ title: 'Error', message: 'Failed to create group.', toastType: 'error' })
  } finally {
    creatingGroup.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedRoom.value || !socket.value) return
  
  const content = newMessage.value
  const roomId = selectedRoom.value._id
  const payload = { roomId, content, type: 'text', metadata: { source: 'admin_dashboard' }, replyTo: replyTo.value?._id }
  
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
    isOptimistic: true,
    metadata: { source: 'admin_dashboard' }
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
       socket.value.emit('sendMessage', { roomId: selectedRoom.value._id, content: attachmentCaption.value || 'Image', type: 'image', metadata: { caption: attachmentCaption.value, imageUrl, source: 'admin_dashboard' }, replyTo: replyTo.value?._id })
       cancelAttachment(); replyTo.value = null
    }
  } catch (err) { console.error('Upload failed', err) } finally { uploading.value = false }
}

const toggleEmojiPicker = () => showEmojiPicker.value = !showEmojiPicker.value
const onSelectEmoji = (emoji: any) => { newMessage.value += emoji.i; showEmojiPicker.value = false; messageInput.value?.focus() }

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
  
  // Explicitly check if it was sent from the admin dashboard (robust for identical-account testing)
  if (msg.metadata?.source === 'admin_dashboard' || msg.isOptimistic) return true
  if (msg.metadata?.source === 'user_app') return false // Always on the left if sent from the user app
  
  const senderId = String(msg.sender?._id || msg.sender)
  const myId = String(user.value?._id || user.value?.id || user.value?.sub || '')
  
  if (selectedRoom.value?.type === 'support') {
     // If backend flagged it as a guest message, it's on the left
     if (msg.metadata?.isGuest) return false
     
     // If it matches the guest ID exactly (and wasn't sent from dashboard), it's the customer on the left
     const guestId = String(selectedRoom.value.metadata?.guestIdentifier || selectedRoom.value.metadata?.userId || 'GUEST_NONE')
     if (senderId === guestId) return false
     
     // Otherwise, it must be an admin response.
     return true
  }

  if (senderId && myId && senderId !== 'null' && senderId !== 'undefined' && senderId === myId) {
    return true
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
const filteredChatMessages = computed(() => {
  if (!chatSearchQuery.value) return messages.value
  const query = chatSearchQuery.value.toLowerCase()
  return messages.value.filter((m: any) => m.content?.toLowerCase().includes(query))
})

const shouldShowDate = (index: number) => index === 0 || new Date(filteredChatMessages.value[index].createdAt).toDateString() !== new Date(filteredChatMessages.value[index - 1].createdAt).toDateString()
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
