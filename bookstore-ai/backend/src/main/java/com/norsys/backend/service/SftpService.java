package com.norsys.backend.service;

import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

@Service
public class SftpService {

    @Value("${sftp.username}")
    private String username;

    @Value("${sftp.password}")
    private String password;

    @Value("${sftp.host}")
    private String host;

    @Value("${sftp.port}")
    private int port;

    private Session setupSession() throws Exception {
        JSch jsch = new JSch();
        Session session = jsch.getSession(username, host, port);
        session.setPassword(password);

        Properties config = new Properties();
        config.put("StrictHostKeyChecking", "no");
        session.setConfig(config);
        session.connect();

        return session;
    }

    public void uploadFile(String remoteDirectory, String filename, InputStream inputStream) throws Exception {
        Session session = setupSession();
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect();

        channelSftp.cd(remoteDirectory);
        channelSftp.put(inputStream, filename);

        channelSftp.disconnect();
        session.disconnect();
    }

    public InputStream downloadFile(String remoteDirectory, String filename) throws Exception {
        Session session = setupSession();
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect();

        channelSftp.cd(remoteDirectory);
        InputStream inputStream = channelSftp.get(filename);

        return new InputStream() {
            @Override
            public int read() throws IOException {
                return inputStream.read();
            }

            @Override
            public int read(byte[] b) throws IOException {
                return inputStream.read(b);
            }

            @Override
            public int read(byte[] b, int off, int len) throws IOException {
                return inputStream.read(b, off, len);
            }

            @Override
            public void close() throws IOException {
                super.close();
                inputStream.close();
                channelSftp.disconnect();
                session.disconnect();
            }
        };
    }

    public void deleteFile(String remoteDirectory, String filename) throws Exception {
        Session session = setupSession();
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect();

        channelSftp.cd(remoteDirectory);
        channelSftp.rm(filename);

        channelSftp.disconnect();
        session.disconnect();
    }
}
