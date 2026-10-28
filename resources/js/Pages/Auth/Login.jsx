import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import LoginTemplate from '../../components/templates/LoginTemplate';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Masuk ke SIPBAJA" />
            <LoginTemplate
                form={{ data, setData, processing, errors }}
                onSubmit={handleSubmit}
            />
        </>
    );
}
