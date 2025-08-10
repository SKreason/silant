import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from "../../store/useAuthStore.js";
import { FiX } from "react-icons/fi";
import "../../styles/components/Forms/LoginForm.scss";

/**
 * Компонент формы авторизации
 * @component
 * @param {Object} props - Свойства компонента
 * @param {Function} props.handleModalClose - Функция закрытия модального окна
 * @returns {JSX.Element} Форма входа в систему
 */
const LoginForm = ({ handleModalClose }) => {
    // Получаем необходимые методы и состояние из хранилища
    const { login, isLoading, error } = useAuthStore();

    // Инициализация формы с react-hook-form
    const {
        register,
        formState: { errors },
        handleSubmit,
        watch
    } = useForm({
        mode: "onSubmit",
        defaultValues: {
            login: "",
            password: "",
        }
    });

    // Получаем текущие значения полей для динамической валидации
    const [loginValue, passwordValue] = watch(["login", "password"]);

    /**
     * Обработчик отправки формы
     * @param {Object} values - Значения формы {login: string, password: string}
     */
    const onSubmit = async (values) => {
        const success = await login(values.login, values.password);
        if (success === true) {
            handleModalClose();
        } else {
            console.error("Ошибка авторизации:", success.error);
        }
    };

    return (
        <div className="form-overlay" onClick={handleModalClose}>
            <div
                className="form-body"
                onClick={event => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-form-title"
            >
                <button
                    className="close-btn"
                    onClick={handleModalClose}
                    aria-label="Закрыть форму авторизации"
                >
                    <FiX />
                </button>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Поле ввода логина */}
                    <div className="form-group">
                        <label htmlFor="login">Логин:</label>
                        <div className="input-wrapper">
                            <input
                                id="login"
                                className={loginValue && errors.login ? "error" : ""}
                                {...register("login", {
                                    required: "Обязательное поле"
                                })}
                                aria-invalid={errors.login ? "true" : "false"}
                                aria-describedby="login-error"
                            />
                            {errors.login && (
                                <span id="login-error" className="error-message">
                                    {errors.login.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Поле ввода пароля */}
                    <div className="form-group">
                        <label htmlFor="password">Пароль:</label>
                        <div className="input-wrapper">
                            <input
                                id="password"
                                type="password"
                                className={passwordValue && errors.password ? "error" : ""}
                                {...register("password", {
                                    required: "Обязательное поле"
                                })}
                                aria-invalid={errors.password ? "true" : "false"}
                                aria-describedby="password-error"
                            />
                            {(errors.password || error) && (
                                <span id="password-error" className="error-message">
                                    {errors.password?.message || error}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Кнопка отправки формы */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`submit-btn ${isLoading ? 'loading' : ''}`}
                        aria-busy={isLoading}
                    >
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;