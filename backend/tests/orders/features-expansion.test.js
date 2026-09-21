import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import { Order } from '../../src/models/Order.js';
import { Customer } from '../../src/models/Customer.js';
import { Message } from '../../src/models/Message.js';
import { PaymentAttempt } from '../../src/models/Payment.js';
import * as orderService from '../../src/services/order/order.service.js';
import * as customerAuthService from '../../src/services/customer-auth/customer-auth.service.js';
import * as razorpayService from '../../src/services/payments/razorpay.service.js';
import Razorpay from 'razorpay';
import { config } from '../../src/config/env.js';
import {
    updateCustomerProfileSchema,
    customerAddressInputSchema,
    addressIdParamSchema,
} from '../../src/validators/customer-auth.validator.js';
import { reportOrderIssueSchema } from '../../src/validators/order.validator.js';

describe('Feature Expansion Test Suite: Cancellation, Profile, Address Book, and Issue Reporting', () => {

    // ==========================================
    // 1. Customer Order Cancellation Tests
    // ==========================================
    describe('Customer Order Cancellation', () => {
        test('allows customer to cancel an order when orderStatus is "placed" (COD)', async () => {
            const customerId = new mongoose.Types.ObjectId();
            const orderId = new mongoose.Types.ObjectId();

            const mockOrder = {
                _id: orderId,
                customer: customerId,
                orderStatus: 'placed',
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                save: async function () { return this; },
            };

            const origFindById = Order.findById;
            Order.findById = async (id) => (id.toString() === orderId.toString() ? mockOrder : null);

            try {
                const cancelled = await orderService.cancelCustomerOrder(orderId.toString(), customerId.toString());
                assert.equal(cancelled.orderStatus, 'cancelled');
            } finally {
                Order.findById = origFindById;
            }
        });

        test('safely initiates refund when cancelling a paid Razorpay order', async () => {
            const customerId = new mongoose.Types.ObjectId();
            const orderId = new mongoose.Types.ObjectId();
            const paymentAttemptId = new mongoose.Types.ObjectId();

            const mockOrder = {
                _id: orderId,
                customer: customerId,
                orderStatus: 'placed',
                paymentMethod: 'razorpay',
                paymentStatus: 'paid',
                save: async function () { return this; },
            };

            const origOrderFindById = Order.findById;
            const origOrderFindByIdAndUpdate = Order.findByIdAndUpdate;
            const origPaymentFindOne = PaymentAttempt.findOne;
            const origPaymentFindById = PaymentAttempt.findById;

            razorpayService.setRazorpayClient({
                payments: {
                    refund: async () => ({ id: 'rfnd_test123', status: 'processed' }),
                },
            });

            Order.findById = async (id) => (id.toString() === orderId.toString() ? mockOrder : null);
            Order.findByIdAndUpdate = async () => ({});
            PaymentAttempt.findOne = async () => ({
                _id: paymentAttemptId,
                order: orderId,
                status: 'paid',
                amount: 45000,
                refundId: null,
            });
            PaymentAttempt.findById = async () => ({
                _id: paymentAttemptId,
                order: orderId,
                status: 'paid',
                razorpayPaymentId: 'pay_test123',
                amount: 45000,
                refundId: null,
                save: async function () { return this; },
            });

            try {
                const cancelled = await orderService.cancelCustomerOrder(orderId.toString(), customerId.toString());
                assert.equal(cancelled.orderStatus, 'cancelled');
                assert.equal(cancelled.paymentStatus, 'refunded');
            } finally {
                Order.findById = origOrderFindById;
                Order.findByIdAndUpdate = origOrderFindByIdAndUpdate;
                PaymentAttempt.findOne = origPaymentFindOne;
                PaymentAttempt.findById = origPaymentFindById;
                razorpayService.setRazorpayClient(null);
            }
        });

        test('rejects cancellation when orderStatus has moved past "placed" (e.g. preparing)', async () => {
            const customerId = new mongoose.Types.ObjectId();
            const orderId = new mongoose.Types.ObjectId();

            const mockOrder = {
                _id: orderId,
                customer: customerId,
                orderStatus: 'preparing',
                paymentMethod: 'cod',
            };

            const origFindById = Order.findById;
            Order.findById = async () => mockOrder;

            try {
                await assert.rejects(
                    async () => {
                        await orderService.cancelCustomerOrder(orderId.toString(), customerId.toString());
                    },
                    (err) => {
                        assert.equal(err.statusCode, 400);
                        assert.match(err.message, /cannot be cancelled once preparation has started/i);
                        return true;
                    }
                );
            } finally {
                Order.findById = origFindById;
            }
        });

        test('rejects duplicate cancellation on already cancelled order', async () => {
            const customerId = new mongoose.Types.ObjectId();
            const orderId = new mongoose.Types.ObjectId();

            const mockOrder = {
                _id: orderId,
                customer: customerId,
                orderStatus: 'cancelled',
            };

            const origFindById = Order.findById;
            Order.findById = async () => mockOrder;

            try {
                await assert.rejects(
                    async () => {
                        await orderService.cancelCustomerOrder(orderId.toString(), customerId.toString());
                    },
                    (err) => {
                        assert.equal(err.statusCode, 400);
                        assert.match(err.message, /already cancelled/i);
                        return true;
                    }
                );
            } finally {
                Order.findById = origFindById;
            }
        });

        test('rejects cancellation if customer does not own the order (403 Forbidden)', async () => {
            const ownerId = new mongoose.Types.ObjectId();
            const attackerId = new mongoose.Types.ObjectId();
            const orderId = new mongoose.Types.ObjectId();

            const mockOrder = {
                _id: orderId,
                customer: ownerId,
                orderStatus: 'placed',
            };

            const origFindById = Order.findById;
            Order.findById = async () => mockOrder;

            try {
                await assert.rejects(
                    async () => {
                        await orderService.cancelCustomerOrder(orderId.toString(), attackerId.toString());
                    },
                    (err) => {
                        assert.equal(err.statusCode, 403);
                        assert.match(err.message, /not authorized/i);
                        return true;
                    }
                );
            } finally {
                Order.findById = origFindById;
            }
        });
    });

    // ==========================================
    // 2. Customer Profile Update Tests
    // ==========================================
    describe('Customer Profile Update', () => {
        test('updateCustomerProfileSchema validates name and phone format', async () => {
            const valid = await updateCustomerProfileSchema.safeParseAsync({
                name: 'Aarav Gupta',
                phone: '+91 9876543210',
            });
            assert.equal(valid.success, true);
            assert.equal(valid.data.name, 'Aarav Gupta');

            const invalidPhone = await updateCustomerProfileSchema.safeParseAsync({
                phone: '123',
            });
            assert.equal(invalidPhone.success, false);

            const shortName = await updateCustomerProfileSchema.safeParseAsync({
                name: 'A',
            });
            assert.equal(shortName.success, false);
        });

        test('updateCustomerProfile updates customer name and phone without exposing credentials', async () => {
            const customerId = new mongoose.Types.ObjectId();
            const mockCustomer = {
                _id: customerId,
                name: 'Old Name',
                email: 'customer@example.com',
                phone: '9876543210',
                passwordHash: 'secret_hash',
                save: async function () { return this; },
            };

            const origFindById = Customer.findById;
            Customer.findById = async () => mockCustomer;

            try {
                const res = await customerAuthService.updateCustomerProfile(customerId.toString(), {
                    name: 'New Name',
                    phone: '9123456780',
                });

                assert.equal(res.customer.name, 'New Name');
                assert.equal(res.customer.phone, '9123456780');
                assert.equal(res.customer.email, 'customer@example.com');
            } finally {
                Customer.findById = origFindById;
            }
        });
    });

    // ==========================================
    // 3. Customer Address Book CRUD Tests
    // ==========================================
    describe('Customer Address Book', () => {
        test('customerAddressInputSchema validates address input fields', async () => {
            const valid = await customerAddressInputSchema.safeParseAsync({
                label: 'Home',
                firstName: 'Rohan',
                lastName: 'Verma',
                phone: '9876543210',
                address: 'Flat 402, Royal Residency',
                area: 'Civil Lines',
                isDefault: true,
            });
            assert.equal(valid.success, true);
            assert.equal(valid.data.label, 'Home');
            assert.equal(valid.data.isDefault, true);

            const missingStreet = await customerAddressInputSchema.safeParseAsync({
                firstName: 'Rohan',
                lastName: 'Verma',
                phone: '9876543210',
            });
            assert.equal(missingStreet.success, false);
        });

        test('addressIdParamSchema validates 24-character hex Mongo ObjectId', async () => {
            const valid = await addressIdParamSchema.safeParseAsync({
                addressId: '507f1f77bcf86cd799439011',
            });
            assert.equal(valid.success, true);

            const invalid = await addressIdParamSchema.safeParseAsync({
                addressId: 'not-an-id',
            });
            assert.equal(invalid.success, false);
        });

        test('addCustomerAddress appends address and ensures default management', async () => {
            const customerId = new mongoose.Types.ObjectId();
            const mockCustomer = {
                _id: customerId,
                addresses: [],
                save: async function () { return this; },
            };

            const origFindById = Customer.findById;
            Customer.findById = async () => mockCustomer;

            try {
                const addresses = await customerAuthService.addCustomerAddress(customerId.toString(), {
                    label: 'Office',
                    firstName: 'Rohan',
                    lastName: 'Verma',
                    phone: '9876543210',
                    address: 'Tech Park, Sector 5',
                    isDefault: true,
                });

                assert.equal(addresses.length, 1);
                assert.equal(addresses[0].label, 'Office');
                assert.equal(addresses[0].isDefault, true);
            } finally {
                Customer.findById = origFindById;
            }
        });

        test('setDefaultCustomerAddress unsets other addresses default flag', async () => {
            const customerId = new mongoose.Types.ObjectId();
            const addr1Id = new mongoose.Types.ObjectId();
            const addr2Id = new mongoose.Types.ObjectId();

            const mockCustomer = {
                _id: customerId,
                addresses: [
                    { _id: addr1Id, label: 'Home', isDefault: true },
                    { _id: addr2Id, label: 'Office', isDefault: false },
                ],
                save: async function () { return this; },
            };

            const origFindById = Customer.findById;
            Customer.findById = async () => mockCustomer;

            try {
                const addresses = await customerAuthService.setDefaultCustomerAddress(
                    customerId.toString(),
                    addr2Id.toString()
                );

                assert.equal(addresses.find((a) => a._id.toString() === addr1Id.toString()).isDefault, false);
                assert.equal(addresses.find((a) => a._id.toString() === addr2Id.toString()).isDefault, true);
            } finally {
                Customer.findById = origFindById;
            }
        });

        test('deleteCustomerAddress removes specified address', async () => {
            const customerId = new mongoose.Types.ObjectId();
            const addr1Id = new mongoose.Types.ObjectId();
            const addr2Id = new mongoose.Types.ObjectId();

            const mockCustomer = {
                _id: customerId,
                addresses: [
                    { _id: addr1Id, label: 'Home', isDefault: true },
                    { _id: addr2Id, label: 'Office', isDefault: false },
                ],
                save: async function () { return this; },
            };

            const origFindById = Customer.findById;
            Customer.findById = async () => mockCustomer;

            try {
                const remaining = await customerAuthService.deleteCustomerAddress(
                    customerId.toString(),
                    addr2Id.toString()
                );

                assert.equal(remaining.length, 1);
                assert.equal(remaining[0]._id.toString(), addr1Id.toString());
            } finally {
                Customer.findById = origFindById;
            }
        });
    });

    // ==========================================
    // 4. Order Issue Reporting Tests
    // ==========================================
    describe('Order Issue Reporting', () => {
        test('reportOrderIssueSchema validates issueType enum and description length', async () => {
            const valid = await reportOrderIssueSchema.safeParseAsync({
                issueType: 'missing_item',
                description: 'The biryani raita was missing from our order packet.',
            });
            assert.equal(valid.success, true);
            assert.equal(valid.data.issueType, 'missing_item');

            const shortDesc = await reportOrderIssueSchema.safeParseAsync({
                issueType: 'missing_item',
                description: 'Bad',
            });
            assert.equal(shortDesc.success, false);

            const invalidCategory = await reportOrderIssueSchema.safeParseAsync({
                issueType: 'unsupported_type',
                description: 'Valid long description here',
            });
            assert.equal(invalidCategory.success, false);
        });

        test('reportOrderIssue creates Message record linked to customer and order', async () => {
            const customerId = new mongoose.Types.ObjectId();
            const orderId = new mongoose.Types.ObjectId();

            const mockOrder = {
                _id: orderId,
                orderNumber: 'ORD-987654',
                customer: customerId,
                customerInfo: { name: 'Pooja', phone: '9876543210' },
            };

            const origOrderFindById = Order.findById;
            const origCustomerFindById = Customer.findById;
            const origMessageFindOne = Message.findOne;
            const origMessageSave = Message.prototype.save;

            let createdMessageDoc = null;
            Order.findById = async () => mockOrder;
            Customer.findById = async () => ({ _id: customerId, name: 'Pooja', email: 'pooja@example.com', phone: '9876543210' });
            Message.findOne = async () => null; // No duplicate
            Message.prototype.save = async function () {
                createdMessageDoc = this;
                return this;
            };

            try {
                const result = await orderService.reportOrderIssue(
                    orderId.toString(),
                    customerId.toString(),
                    {
                        issueType: 'damaged_spilled',
                        description: 'Gravy was completely spilled inside the container.',
                    }
                );

                assert.ok(result);
                assert.equal(createdMessageDoc.type, 'order_issue');
                assert.equal(createdMessageDoc.order.toString(), orderId.toString());
                assert.equal(createdMessageDoc.orderNumber, 'ORD-987654');
                assert.equal(createdMessageDoc.issueType, 'damaged_spilled');
                assert.equal(createdMessageDoc.message, 'Gravy was completely spilled inside the container.');
            } finally {
                Order.findById = origOrderFindById;
                Customer.findById = origCustomerFindById;
                Message.findOne = origMessageFindOne;
                Message.prototype.save = origMessageSave;
            }
        });

        test('reportOrderIssue rejects unauthorized customer reporting on someone else order (403)', async () => {
            const ownerId = new mongoose.Types.ObjectId();
            const otherCustomerId = new mongoose.Types.ObjectId();
            const orderId = new mongoose.Types.ObjectId();

            const mockOrder = {
                _id: orderId,
                customer: ownerId,
            };

            const origOrderFindById = Order.findById;
            Order.findById = async () => mockOrder;

            try {
                await assert.rejects(
                    async () => {
                        await orderService.reportOrderIssue(
                            orderId.toString(),
                            otherCustomerId.toString(),
                            {
                                issueType: 'wrong_item',
                                description: 'Received incorrect items.',
                            }
                        );
                    },
                    (err) => {
                        assert.equal(err.statusCode, 403);
                        assert.match(err.message, /not authorized/i);
                        return true;
                    }
                );
            } finally {
                Order.findById = origOrderFindById;
            }
        });
    });
});
