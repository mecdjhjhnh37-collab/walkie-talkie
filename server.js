    socket.on('call-user', (data) => {
        if (data.roomId === 'general') return;
        // إرسال الإشارة لكل الموجودين في الغرفة ما عدا الشخص المتصل نفسه
        socket.to(data.roomId).emit('incoming-call', {
            signal: data.signal,
            from: data.from,
            type: data.type,
            roomId: data.roomId
        });
    });

    socket.on('accept-call', (data) => {
        socket.to(data.roomId).emit('call-accepted', data.signal);
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', data.candidate);
    });

    socket.on('end-call', (data) => {
        socket.to(data.roomId).emit('call-ended');
    });
