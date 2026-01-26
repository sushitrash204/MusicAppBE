import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    fullName: string;
    username: string;
    password: string; // Hashed
    phoneNumber: string;
    emails: string[];
    isPremium: boolean;
    role: 'user' | 'admin';
    premiumExpiryDate?: Date;
    createdAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
    fullName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    emails: [{
        type: String
    }],
    isPremium: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    premiumExpiryDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Mã hóa mật khẩu trước khi lưu
// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (this: IUser) {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức kiểm tra mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
